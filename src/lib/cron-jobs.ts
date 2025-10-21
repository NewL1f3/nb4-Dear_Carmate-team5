import cron from 'node-cron';
import { v2 as cloudinary } from 'cloudinary';
import prisma from './prisma';

// 미연결된 계약서를 DB와 Cloudinary에서 삭제
const findAndDeleteOrphanDocuments = async () => {
  console.log('[CRON] 미연결 문서 삭제 작업을 시작합니다.');

  // 24시간 이전의 타임스탬프 계산
  const oneDaysAgo = new Date();
  oneDaysAgo.setDate(oneDaysAgo.getDate() - 1);

  // 조건: contractId가 null이고, 생성된 지 24시간(1일)이 지난 문서 조회
  try {
    const orphanDocuments = await prisma.contractDocument.findMany({
      where: {
        contractId: null,
        createdAt: {
          lt: oneDaysAgo,
        },
      },
      select: {
        id: true,
        publicId: true,
      },
    });

    if (orphanDocuments.length === 0) {
      return console.log('[CRON] 삭제할 미연결 문서가 없습니다.');
    }

    const publicIdsToDelete = orphanDocuments.map((document) => document.publicId);
    const documentIdsToDelete = orphanDocuments.map((document) => document.id);

    console.log(
      `[CRON] 삭제 대상 문서 ${documentIdsToDelete.length}개 발견. Public IDs: ${publicIdsToDelete.join(', ')}`,
    );

    // Cloudinary에서 파일 삭제
    try {
      const cloudinaryResult = await cloudinary.api.delete_resources(publicIdsToDelete, {
        type: 'authenticated',
        resource_type: 'raw',
      });

      console.log('[Cloudinary] 삭제 결과:', cloudinaryResult);
    } catch (err) {
      // Cloudinary 삭제 실패 시 DB 삭제를 막고 즉시 종료 (데이터 무결성 유지)
      return console.error('[Cloudinary] 파일 삭제 중 오류 발생. DB 삭제를 건너뛰고 다음 스케줄에 재시도합니다:', err);
    }

    // DB에서 일괄 삭제 (Cloudinary 삭제 성공시에만 실행)
    const contractDocument = await prisma.contractDocument.deleteMany({
      where: {
        id: {
          in: documentIdsToDelete,
        },
      },
    });

    console.log(`[DB] 총 ${contractDocument.count}개의 미연결 문서를 삭제했습니다.`);

    return orphanDocuments;
  } catch (err) {
    return console.error('[CRON ERROR] 미연결 문서 삭제 중 오류 발생:', err);
  }
};

// cron 작업 스케줄 설정
export const startCleanupJob = () => {
  // '0 3 * * *' : 매일 3시 00분 (분 시 일 월 요일)
  cron.schedule(
    '0 3 * * *',
    async () => {
      await findAndDeleteOrphanDocuments();
    },
    {
      timezone: 'Asia/Seoul',
    },
  );

  console.log('[CRON] 미연결 문서 삭제 스케줄러가 시작되었습니다.');
};
