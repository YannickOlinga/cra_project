import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import { createTransport, type Transporter } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { join } from 'path';
import { ContactMessageDto } from './dto/contact-message.dto';

@Injectable()
export class MailService {
  private readonly nodemailerTransport: Transporter;

  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    const port = Number(this.configService.get<string>('EMAIL_PORT') ?? 465);

    this.nodemailerTransport = createTransport({
      host: this.configService.get<string>('EMAIL_HOST') ?? 'smtp.gmail.com',
      port,
      secure: this.configService.get<string>('EMAIL_SECURE')
        ? this.configService.get<string>('EMAIL_SECURE') === 'true'
        : port === 465,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  async sendResetPasswordEmail(to: string, firstName: string, token: string) {
    const resetUrl = this.buildResetPasswordUrl(token);
    const appName = this.configService.get<string>('APP_NAME') ?? 'Terenick';
    const logo = this.buildLogoOptions();
    const escapedFirstName = this.escapeHtml(firstName);
    const escapedResetUrl = this.escapeHtml(resetUrl);
    const escapedAppName = this.escapeHtml(appName);
    const escapedLogoSrc = this.escapeHtml(logo.src);

    return this.sendMail({
      to,
      from:
        this.configService.get<string>('EMAIL_FROM') ??
        this.configService.get<string>('EMAIL_USER'),
      subject: `${appName} - Reinitialisation de votre mot de passe`,
      attachments: logo.attachments,
      text: [
        `Bonjour ${firstName},`,
        '',
        'Vous avez demande la reinitialisation de votre mot de passe.',
        `Cliquez sur ce lien pour choisir un nouveau mot de passe: ${resetUrl}`,
        '',
        "Ce lien expire prochainement. Si vous n'etes pas a l'origine de cette demande, ignorez cet email.",
        '',
        "L'equipe Terenick",
      ].join('\n'),
      html: `
        <div style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#28323c;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f4f6f8;">
            <tr>
              <td align="center" style="padding:32px 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;border-collapse:collapse;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 32px rgba(31,42,55,0.12);">
                  <tr>
                    <td style="padding:28px 32px;background:#3f5368;color:#ffffff;">
                      <img src="${escapedLogoSrc}" width="56" height="56" alt="${escapedAppName}" style="display:block;width:56px;height:56px;margin:0 0 18px;border-radius:12px;">
                      <p style="margin:0 0 8px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#dbe8f4;">Securite du compte</p>
                      <h1 style="margin:0;font-size:28px;line-height:1.2;font-weight:700;">Reinitialisation de votre mot de passe</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px;">
                      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Bonjour ${escapedFirstName},</p>
                      <p style="margin:0 0 22px;font-size:16px;line-height:1.6;">
                        Vous avez demande la reinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
                      </p>
                      <p style="margin:0 0 26px;">
                        <a href="${escapedResetUrl}" style="display:inline-block;padding:14px 22px;background:#3f5368;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;">
                          Choisir un nouveau mot de passe
                        </a>
                      </p>
                      <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#66717d;">
                        Ce lien expire prochainement. Si vous n'etes pas a l'origine de cette demande, vous pouvez ignorer cet email.
                      </p>
                      <p style="margin:0;font-size:16px;line-height:1.6;">
                        L'equipe Terenick
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      `,
    });
  }

  async sendContactMessage(contactMessage: ContactMessageDto) {
    const appName = this.configService.get<string>('APP_NAME') ?? 'Terenick';
    const contactRecipient =
      this.configService.get<string>('CONTACT_EMAIL_TO') ??
      this.configService.get<string>('EMAIL_FROM') ??
      this.configService.get<string>('EMAIL_USER') ??
      'contact@terenick.com';
    const from =
      this.configService.get<string>('EMAIL_FROM') ??
      this.configService.get<string>('EMAIL_USER');

    const name = contactMessage.name.trim();
    const email = contactMessage.email.trim();
    const subject = contactMessage.subject.trim();
    const message = contactMessage.message.trim();

    const escapedName = this.escapeHtml(name);
    const escapedEmail = this.escapeHtml(email);
    const escapedSubject = this.escapeHtml(subject);
    const escapedMessage = this.escapeHtml(message).replace(/\n/g, '<br>');

    return this.sendMail({
      to: contactRecipient,
      from,
      replyTo: email,
      subject: `[${appName}] Nouveau message contact - ${subject}`,
      text: [
        'Nouveau message depuis le formulaire de contact.',
        '',
        `Nom: ${name}`,
        `Email: ${email}`,
        `Sujet: ${subject}`,
        '',
        'Message:',
        message,
      ].join('\n'),
      html: `
        <div style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#28323c;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f4f6f8;">
            <tr>
              <td align="center" style="padding:32px 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;border-collapse:collapse;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 32px rgba(31,42,55,0.12);">
                  <tr>
                    <td style="padding:28px 32px;background:#2c3e50;color:#ffffff;">
                      <p style="margin:0 0 8px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#dbe8f4;">Formulaire de contact</p>
                      <h1 style="margin:0;font-size:28px;line-height:1.2;font-weight:700;">Nouveau message recu</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px;">
                      <p style="margin:0 0 10px;font-size:15px;line-height:1.6;"><strong>Nom :</strong> ${escapedName}</p>
                      <p style="margin:0 0 10px;font-size:15px;line-height:1.6;"><strong>Email :</strong> <a href="mailto:${escapedEmail}" style="color:#2c3e50;">${escapedEmail}</a></p>
                      <p style="margin:0 0 22px;font-size:15px;line-height:1.6;"><strong>Sujet :</strong> ${escapedSubject}</p>
                      <div style="padding:18px 20px;background:#f6f8fb;border:1px solid #e5ebf2;border-radius:12px;font-size:16px;line-height:1.7;">
                        ${escapedMessage}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      `,
    });
  }

  private buildResetPasswordUrl(token: string): string {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5174';
    const resetPath =
      this.configService.get<string>('RESET_PASSWORD_PATH') ??
      '/reset-password';
    const url = new URL(resetPath, frontendUrl);
    url.searchParams.set('token', token);
    return url.toString();
  }

  private buildLogoOptions(): {
    src: string;
    attachments?: Mail.Attachment[];
  } {
    const logoPath =
      this.configService.get<string>('EMAIL_LOGO_PATH') ??
      join(
        process.cwd(),
        '..',
        'terenick',
        'public',
        'Logo-favicon-de-base-cra.ico',
      );

    if (existsSync(logoPath)) {
      return {
        src: 'cid:terenick-logo',
        attachments: [
          {
            filename: 'terenick-logo.ico',
            path: logoPath,
            cid: 'terenick-logo',
          },
        ],
      };
    }

    return {
      src:
        this.configService.get<string>('EMAIL_LOGO_URL') ??
        this.buildFrontendAssetUrl('/Logo-favicon-de-base-cra.ico'),
    };
  }

  private buildFrontendAssetUrl(path: string): string {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5174';
    return new URL(path, frontendUrl).toString();
  }

  private sendMail(options: Mail.Options) {
    this.logger.log(`Email envoye a ${options.to}`);
    return this.nodemailerTransport.sendMail(options);
  }

  private escapeHtml(value: string): string {
    return value.replace(
      /[&<>"']/g,
      (character) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;',
        })[character] ?? character,
    );
  }
}
