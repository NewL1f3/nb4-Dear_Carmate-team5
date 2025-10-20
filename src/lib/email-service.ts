import * as nodemailer from 'nodemailer';

// 첨부 파일
export interface AttachmentInfo {
  fileName: string;
  fileUrl: string;
  contentType: string;
}

// Nodemailer 트랜스포터 설정
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  // 587 포트 사용 시 secure: false
  // 465 포트 사용 시 secure: true
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'test.user@ethereal.email',
    pass: process.env.SMTP_PASS || 'some_password',
  },
  tls: {
    rejectUnauthorized: true,
  },
});

// 계약서 첨부 이메일 발송
export const sendContractEmail = async (
  toName: string,
  toEmail: string,
  attachmentsData: AttachmentInfo[],
): Promise<boolean> => {
  if (!attachmentsData || attachmentsData.length === 0) {
    throw new Error('첨부할 파일 URL이 유효하지 않습니다.');
  }

  try {
    const fromEmail = process.env.SMTP_USER;

    console.log('finalAttachments:', attachmentsData);

    const info = await transporter.sendMail({
      // 발신자 주소
      from: fromEmail,
      // 수신자 주소
      to: toEmail,
      // 제목
      subject: `[계약서] ${toName} 고객님의 계약서가 발송되었습니다.`,
      // 메일 본문
      html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #333;">계약서 파일 첨부 안내</h2>
                    <p>${toName} 고객님, 계약서 파일이 첨부되었습니다. 파일을 확인해 주시기 바랍니다.</p>
                    <p style="margin-top: 20px; color: #888;">본 메일은 자동 발송된 메일입니다.</p>
                </div>
            `,
      // 다중 파일 첨부
      attachments: attachmentsData,
    });

    console.log('이메일 발송 성공:', info.messageId);

    return true;
  } catch (error) {
    console.error('이메일 발송 실패:', error);
    throw new Error('이메일 전송 중 오류가 발생했습니다.');
  }
};
