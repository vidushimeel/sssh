import { Injectable } from '@nestjs/common';
import AWS, { SES } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { formatEmailParams } from './helpers/formatEmailParams';

@Injectable()
export class MailService {
  private sesService: SES;

  constructor() {
    this.sesService = new SES({
      apiVersion: '2010-12-01',
      region: process.env.AWS_API_REGION,
    });
  }

  sendEmail(
    senderAddress: string,
    receptorAddresses: string[],
    htmlBody: string,
    textBody: string,
    subject: string,
  ): Promise<PromiseResult<SES.SendEmailResponse, AWS.AWSError>> {
    const params = formatEmailParams(
      senderAddress,
      receptorAddresses,
      htmlBody,
      textBody,
      subject,
    );
    return this.sesService.sendEmail(params).promise();
  }

  sendEmailAsSESIdentity(
    receptorAddresses: string[],
    htmlBody: string,
    textBody: string,
    subject: string,
  ): Promise<PromiseResult<SES.SendEmailResponse, AWS.AWSError>> {
    return this.sendEmail(
      process.env.SES_IDENTITY_EMAIL,
      receptorAddresses,
      htmlBody,
      textBody,
      subject,
    );
  }
}