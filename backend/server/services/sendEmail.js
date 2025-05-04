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

export const sendAppointmentEmail = async ({ email, name, doctorName, date, time, status, notes, subject }) => {
  // Format the date nicely
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format the time nicely (assuming time is in HH:MM format)
  const [hour, minute] = time.split(':');
  const timeObj = new Date();
  timeObj.setHours(parseInt(hour, 10));
  timeObj.setMinutes(parseInt(minute, 10));
  const formattedTime = timeObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Set background color based on status
  let statusColor = '#4287f5'; // blue for default/pending
  let statusMessage = 'Your appointment has been requested.';

  if (status === 'confirmed') {
    statusColor = '#28a745'; // green
    statusMessage = 'Your appointment has been confirmed.';
  } else if (status === 'rejected') {
    statusColor = '#dc3545'; // red
    statusMessage = 'Your appointment request has been rejected.';
  } else if (status === 'completed') {
    statusColor = '#6c757d'; // gray
    statusMessage = 'Your appointment has been marked as completed.';
  } else if (status === 'cancelled') {
    statusColor = '#ffc107'; // yellow
    statusMessage = 'Your appointment has been cancelled.';
  }

  const mailOptions = {
    from: `"MedAI Appointments" <${process.env.EMAIL_USERNAME}>`,
    to: email,
    subject: subject || `Appointment Update with Dr. ${doctorName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
        <div style="margin-bottom: 20px;">
          <h2 style="color: ${statusColor};">Appointment ${status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Update'}</h2>
        </div>
        <p>Hello ${name},</p>
        <p>${statusMessage}</p>
        <div style="background-color: #f5f8ff; padding: 15px; margin: 15px 0; border-left: 3px solid ${statusColor};">
          <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${formattedTime}</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        </div>
        <p>If you have any questions, please contact our support team.</p>
        <p>Thank you,<br>The MedAI Team</p>
        <hr style="border: none; border-top: 1px solid #e1e1e1; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">
          This is an automated email from MedAI.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Appointment email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send appointment email to ${email}:`, error.message);
    throw error;
  }
};