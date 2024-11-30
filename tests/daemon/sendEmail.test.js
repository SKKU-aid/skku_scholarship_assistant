// tests/daemon/sendEmail.test.js

jest.mock('nodemailer');

const nodemailer = require('nodemailer');
const sendEmailNotification = require('../../src/daemon/sendEmail');

describe('sendEmailNotification', () => {
  let sendMailMock;

  beforeAll(() => {
    process.env.user = 'testuser@example.com';
    process.env.pass = 'testpassword';
  });

  beforeEach(() => {
    sendMailMock = jest.fn((mailOptions, callback) => {
      callback(null, { response: 'Email sent' });
    });

    nodemailer.createTransport.mockReturnValue({
      sendMail: sendMailMock,
    });

    console.log = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send email with correct options for verification type', () => {
    const data = {
      email: 'user@example.com',
      type: 'verification',
      content: { verifyCode: 'ABC123' },
    };

    sendEmailNotification(data);

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: process.env.user,
        to: data.email,
        subject: 'SKKU Scholarship Verification Code',
        text: expect.stringContaining('Verification Code:\nABC123'),
      }),
      expect.any(Function)
    );
  });

  it('should send email with correct options for sendMatchingScholarships type', () => {
    const data = {
      email: 'user@example.com',
      type: 'sendMatchingScholarships',
      content: [
        {
          scholarshipName: 'Scholarship A',
          foundation: 'Foundation A',
          scholarshipType: 'Type A',
          numberOfRecipients: 10,
          scholarshipAmount: '$1000',
          applicationPeriod: '2023-01-01 ~ 2023-12-31',
          eligibleMajors: ['Engineering', 'Science'],
          link: 'http://example.com/scholarshipA',
        },
      ],
    };

    sendEmailNotification(data);

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: process.env.user,
        to: data.email,
        subject: 'Updated Info on Recommended Scholarships',
        text: expect.stringContaining('There is updated information regarding the recommended scholarship.\n\n'),
      }),
      expect.any(Function)
    );
  });

  it('should send email with correct options for sendSavedScholarshipsBeforeDeadline type', () => {
    const data = {
      email: 'user@example.com',
      type: 'sendSavedScholarshipsBeforeDeadline',
      content: [
        {
          scholarshipName: 'Scholarship B',
          foundation: 'Foundation B',
          scholarshipType: 'Type B',
          numberOfRecipients: 5,
          scholarshipAmount: '$2000',
          applicationPeriod: '2023-06-01 ~ 2023-12-31',
          eligibleMajors: ['Arts', 'Humanities'],
          link: 'http://example.com/scholarshipB',
        },
      ],
    };

    sendEmailNotification(data);

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: process.env.user,
        to: data.email,
        subject: 'The deadline for your saved scholarship is approaching',
        text: expect.stringContaining('There are 3 days left until the deadline for the saved scholarship.\n\n'),
      }),
      expect.any(Function)
    );
  });

  it('should send email with correct options for sendUpdatedSavedScholarships type', () => {
    const data = {
      email: 'user@example.com',
      type: 'sendUpdatedSavedScholarships',
      content: [
        {
          scholarshipName: 'Scholarship C',
          foundation: 'Foundation C',
          scholarshipType: 'Type C',
          numberOfRecipients: 20,
          scholarshipAmount: '$1500',
          applicationPeriod: '2023-03-01 ~ 2023-12-31',
          eligibleMajors: ['Business', 'Economics'],
          link: 'http://example.com/scholarshipC',
        },
      ],
    };

    sendEmailNotification(data);

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: process.env.user,
        to: data.email,
        subject: 'Updated Info for your saved Scholarships',
        text: expect.stringContaining('There is updated information regarding the saved scholarship.\n\n'),
      }),
      expect.any(Function)
    );
  });

  it('should handle sendMail errors', () => {
    sendMailMock.mockImplementation((mailOptions, callback) => {
      callback(new Error('Failed to send email'), null);
    });

    const data = {
      email: 'user@example.com',
      type: 'verification',
      content: { verifyCode: 'ABC123' },
    };

    sendEmailNotification(data);

    expect(console.log).toHaveBeenCalledWith('Error sending email: ', expect.any(Error));
  });
});
