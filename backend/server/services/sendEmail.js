import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export const sendReminderEmail = async ({ email, name, medicine, dosage, time }) => {
  const mailOptions = {
    from: `"MedAI Reminders" <${process.env.EMAIL_USERNAME}>`,
    to: email,
    subject: `Medication Reminder: ${medicine} for ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
        <div style="margin-bottom: 20px;">
          <h2 style="color: #4287f5;">Medication Reminder</h2>
        </div>
        <p>Hello ${name},</p>
        <p>This is a reminder to take your scheduled medication:</p>
        <div style="background-color: #f5f8ff; padding: 15px; margin: 15px 0; border-left: 3px solid #4287f5;">
          <p><strong>Medicine:</strong> ${medicine}</p>
          <p><strong>Dosage:</strong> ${dosage}</p>
          <p><strong>Scheduled Time:</strong> ${time}</p>
        </div>
        <p>Stay well,<br>The MedAI Team</p>
        <hr style="border: none; border-top: 1px solid #e1e1e1; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">
          This is an automated reminder from MedAI. To unsubscribe from these reminders, 
          <a href="{unsubscribe_link}" style="color: #4287f5;">click here</a>.
        </p>
      </div>
    `,
    headers: {
      'List-Unsubscribe': '<{unsubscribe_link}>',
      'Precedence': 'bulk'
    }
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed to send reminder to ${email}:`, error.message);
  }
};