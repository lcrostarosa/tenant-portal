export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Email skipped - no RESEND_API_KEY] To: ${to}, Subject: ${subject}`)
    return false
  }

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "Property Manager <noreply@example.com>",
      to,
      subject,
      html,
    })
    return true
  } catch (err) {
    console.error("Email send failed:", err)
    return false
  }
}

export function maintenanceStatusUpdateEmail(
  tenantName: string,
  requestTitle: string,
  newStatus: string
): { subject: string; html: string } {
  return {
    subject: `Maintenance Update: ${requestTitle}`,
    html: `
      <h2>Maintenance Request Update</h2>
      <p>Hi ${tenantName},</p>
      <p>Your maintenance request "<strong>${requestTitle}</strong>" has been updated to: <strong>${newStatus.replace(/_/g, " ")}</strong>.</p>
      <p>Log in to the Tenant Portal to view details and respond.</p>
    `,
  }
}

export function preventiveMaintenanceReminderEmail(
  ownerName: string,
  itemTitle: string,
  dueDate: string
): { subject: string; html: string } {
  return {
    subject: `Preventive Maintenance Due: ${itemTitle}`,
    html: `
      <h2>Preventive Maintenance Reminder</h2>
      <p>Hi ${ownerName},</p>
      <p>"<strong>${itemTitle}</strong>" is due on <strong>${dueDate}</strong>.</p>
      <p>Log in to mark it as completed when done.</p>
    `,
  }
}

export function billingDueReminderEmail(
  tenantName: string,
  amount: string,
  dueDate: string
): { subject: string; html: string } {
  return {
    subject: `Rent Reminder: ${amount} due ${dueDate}`,
    html: `
      <h2>Billing Reminder</h2>
      <p>Hi ${tenantName},</p>
      <p>You have a charge of <strong>${amount}</strong> due on <strong>${dueDate}</strong>.</p>
      <p>Log in to the Tenant Portal to view your billing details.</p>
    `,
  }
}
