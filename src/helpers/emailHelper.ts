import { Resend } from 'resend';
import config from '../config';
import { errorLogger, logger } from '../shared/logger';
import { ISendEmail } from '../types/email';

const resend = new Resend(config.resend_api_key);

const sendEmail = async (values: ISendEmail) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Orenda Vault <onboarding@resend.dev>',
      to: values.to,
      subject: values.subject,
      html: values.html,
    });

    if (error) {
      errorLogger.error('Email send error', error);
      return;
    }

    logger.info('Mail sent successfully', data?.id);
  } catch (error) {
    errorLogger.error('Email', error);
  }
};

export const emailHelper = {
  sendEmail,
};
