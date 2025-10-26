import sgMail, { MailDataRequired } from '@sendgrid/mail';
import axios from 'axios';
import nodemailer from 'nodemailer';

// 첨부 파일
export interface AttachmentInfo {
  fileName: string;
  fileUrl: string;
  contentType: string;
}
interface SendGridAttachmentData {
  content: string;
  filename: string;
  type: string;
  disposition: 'attachment' | 'inline';
}

// SendGrid API 키 설정
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// 헬퍼 함수: URL에서 파일을 가져와 Base64로 인코딩
const encodeAttachment = async (attachment: AttachmentInfo): Promise<SendGridAttachmentData> => {
  try {
    // 파일 요청
    console.log('attachment.fileUrl:', attachment.fileUrl);
    const response = await axios({
      method: 'GET',
      url: attachment.fileUrl,
      responseType: 'arraybuffer',
    });

    // 데이터를 읽어 버퍼로 변환
    const base64Content = Buffer.from(response.data, 'binary').toString('base64');

    // 데이터 가공
    return {
      content: base64Content,
      filename: attachment.fileName,
      type: attachment.contentType,
      disposition: 'attachment',
    };
  } catch (error) {
    console.error(`ERROR: 파일 URL ${attachment.fileUrl}에서 첨부 파일을 가져오거나 인코딩하는 중 오류 발생:`, error);
    throw new Error(`첨부 파일 처리 실패: ${attachment.fileName}`);
  }
};

// 계약서 첨부 이메일 발송 (SendGrid 버전)
export const sendContractEmail = async (toName: string, toEmail: string, attachmentsData: AttachmentInfo[]) => {
  if (!SENDGRID_API_KEY) {
    return console.error('ERROR: SendGrid API 키가 설정되어 있지 않습니다.');
  }

  if (!attachmentsData || attachmentsData.length === 0) {
    throw new Error('첨부할 파일 URL이 유효하지 않습니다.');
  }

  try {
    // 다중 첨부 파일을 SendGrid 형식(Base64)에 맞게 준비합니다.
    console.log('첨부 파일을 다운로드 및 인코딩 중...');
    const sendgridAttachments = [];
    for (const attachment of attachmentsData) {
      const encodedAttachment = await encodeAttachment(attachment);
      sendgridAttachments.push(encodedAttachment);
    }
    console.log(`성공적으로 ${sendgridAttachments.length}개의 첨부 파일 처리 완료.`);

    // 발신자 주소는 .env의 SENDER_EMAIL을 사용하며, SendGrid에서 반드시 인증되어야 합니다.
    const fromEmail = process.env.SENDER_EMAIL;

    if (!fromEmail) {
      throw new Error('발신자 주소를 알 수 없습니다.');
    }

    const msg: MailDataRequired = {
      // 발신자 주소
      from: { email: fromEmail, name: '카메이트 팀' },
      // 수신자 주소
      to: toEmail,
      // 제목
      subject: `[계약서] ${toName} 고객님의 계약서가 발송되었습니다.`,
      // 메일 본문 (HTML)
      html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #333;">계약서 파일 첨부 안내</h2>
                    <p>${toName} 고객님, 계약서 파일이 첨부되었습니다. 파일을 확인해 주시기 바랍니다.</p>
                    <p style="margin-top: 20px; color: #888;">본 메일은 자동 발송된 메일입니다.</p>
                </div>
            `,
      // 다중 파일 첨부 (Base64 인코딩된 데이터)
      attachments: sendgridAttachments,
    };

    // 이메일 발송
    const [response] = await sgMail.send(msg);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return console.log('SendGrid 이메일 발송 성공. Status:', response.statusCode);
    }
  } catch (error) {
    console.error('이메일 발송 실패:', error);
    throw new Error('이메일 전송 중 오류가 발생했습니다.');
  }
};
