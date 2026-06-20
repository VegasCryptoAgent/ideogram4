import twilio from "twilio";
import type Twilio from "twilio/lib/rest/Twilio";

// --------------- Twilio client singleton ---------------

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  throw new Error(
    "TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables must be set"
  );
}

export const twilioClient: Twilio = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER ?? "";

// --------------- Phone number helpers ---------------

/**
 * Search for and purchase a virtual phone number in a given area code.
 * Falls back to any available US number if the area code has none.
 */
export async function purchasePhoneNumber(areaCode?: string): Promise<{
  number: string;
  sid: string;
  friendlyName: string;
}> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const webhookBase =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Search available numbers
  const searchParams: Record<string, string | boolean> = {
    voiceEnabled: true,
    smsEnabled: true,
  };
  if (areaCode) {
    searchParams.areaCode = areaCode;
  }

  const available = await twilioClient
    .availablePhoneNumbers("US")
    .local.list({ ...searchParams, limit: 1 });

  if (available.length === 0) {
    // Try without area code restriction
    const fallback = await twilioClient
      .availablePhoneNumbers("US")
      .local.list({ voiceEnabled: true, smsEnabled: true, limit: 1 });

    if (fallback.length === 0) {
      throw new Error("No available phone numbers found");
    }
    available.push(fallback[0]);
  }

  const phoneNumber = available[0].phoneNumber;

  // Purchase the number
  const purchased = await twilioClient.incomingPhoneNumbers.create({
    phoneNumber,
    voiceUrl: `${webhookBase}/api/twilio/voice`,
    voiceMethod: "POST",
    smsUrl: `${webhookBase}/api/twilio/sms`,
    smsMethod: "POST",
    accountSid,
  });

  return {
    number: purchased.phoneNumber,
    sid: purchased.sid,
    friendlyName: purchased.friendlyName,
  };
}

/**
 * Release / delete a purchased phone number by its Twilio SID.
 */
export async function releasePhoneNumber(sid: string): Promise<void> {
  await twilioClient.incomingPhoneNumbers(sid).remove();
}

/**
 * Update the voice webhook URL for a purchased number (call forwarding config).
 */
export async function configureVoiceWebhook(
  sid: string,
  webhookUrl: string
): Promise<void> {
  await twilioClient.incomingPhoneNumbers(sid).update({
    voiceUrl: webhookUrl,
    voiceMethod: "POST",
  });
}

/**
 * Configure call forwarding for a virtual number using TwiML.
 * @param sid - Twilio Incoming Phone Number SID
 * @param forwardTo - The real phone number to forward calls to
 */
export async function configureCallForwarding(
  sid: string,
  forwardTo: string
): Promise<void> {
  const webhookBase =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  // We use a dynamic webhook that reads the forwardTo from the DB at call time
  await twilioClient.incomingPhoneNumbers(sid).update({
    voiceUrl: `${webhookBase}/api/twilio/voice?forward=${encodeURIComponent(forwardTo)}`,
    voiceMethod: "POST",
  });
}

/**
 * Send an SMS message from a Shielded virtual number.
 */
export async function sendSMS(params: {
  to: string;
  from: string;
  body: string;
}): Promise<{ sid: string; status: string }> {
  const message = await twilioClient.messages.create({
    to: params.to,
    from: params.from,
    body: params.body,
  });

  return { sid: message.sid, status: message.status };
}

/**
 * Fetch call logs for a given phone number SID.
 */
export async function getCallLogs(numberSid: string): Promise<
  Array<{
    sid: string;
    from: string;
    to: string;
    duration: string;
    status: string;
    startTime: Date | null;
    direction: string;
  }>
> {
  // Look up the actual phone number from the SID first
  const phoneNumberResource = await twilioClient
    .incomingPhoneNumbers(numberSid)
    .fetch();
  const phoneNumber = phoneNumberResource.phoneNumber;

  const calls = await twilioClient.calls.list({
    to: phoneNumber,
    limit: 50,
  });

  return calls.map((call) => ({
    sid: call.sid,
    from: call.from,
    to: call.to,
    duration: call.duration,
    status: call.status,
    startTime: call.startTime,
    direction: call.direction,
  }));
}

/**
 * Look up carrier information for a phone number (useful for spam detection).
 */
export async function lookupPhoneNumber(phoneNumber: string): Promise<{
  valid: boolean;
  callerName?: string;
  lineType?: string;
  carrier?: string;
}> {
  try {
    const lookup = await twilioClient.lookups.v2
      .phoneNumbers(phoneNumber)
      .fetch({
        fields: "line_type_intelligence,caller_name",
      } as Parameters<ReturnType<typeof twilioClient.lookups.v2.phoneNumbers>["fetch"]>[0]);

    return {
      valid: lookup.valid,
      callerName:
        (lookup as unknown as { callerName?: { caller_name?: string } })
          .callerName?.caller_name ?? undefined,
      lineType:
        (
          lookup as unknown as {
            lineTypeIntelligence?: { type?: string };
          }
        ).lineTypeIntelligence?.type ?? undefined,
    };
  } catch {
    return { valid: false };
  }
}

/**
 * Generate TwiML to reject a call (used for spam blocking).
 */
export function generateRejectTwiML(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Reject reason="busy"/>
</Response>`;
}

/**
 * Generate TwiML to forward a call to a real number.
 */
export function generateForwardTwiML(forwardTo: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>${forwardTo}</Dial>
</Response>`;
}
