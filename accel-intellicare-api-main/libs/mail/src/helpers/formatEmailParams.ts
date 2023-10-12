import { SendEmailRequest } from 'aws-sdk/clients/ses';

export const formatEmailParams = (
  senderAddress: string,
  receptorAddresses: string[],
  htmlBody: string,
  textBody: string,
  subject: string,
): SendEmailRequest => ({
  Destination: {
    /* required */
    CcAddresses: [senderAddress],
    ToAddresses: [...receptorAddresses],
  },
  Message: {
    /* required */
    Body: {
      /* required */
      Html: {
        Charset: 'UTF-8',
        Data: htmlBody,
      },
      Text: {
        Charset: 'UTF-8',
        Data: textBody,
      },
    },
    Subject: {
      Charset: 'UTF-8',
      Data: subject,
    },
  },
  Source: senderAddress /* required */,
  ReplyToAddresses: [senderAddress],
});