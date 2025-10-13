import express, { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();

const userController = express.Router();

interface UserRegisterBody {
  name: string;
  email: string;
  employeeNumber: string;
  phoneNumber: string;
  password: string;
  passwordConfirmation: string;
  company: string;
  companyCode: string;
}

//회원가입
userController.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, employeeNumber, phoneNumber, password, passwordConfirmation, company, companyCode } = req.body;


    //1.비밀번호 확인
    if (password !== passwordConfirmation) {
      return res.status(400).json({ message: '비밀번호와 비밀번호 확인이 일치하지 않습니다' });
    }
    console.log('회원가입1');

    //2. 이메일 중복
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: '이미 존재하는 이메일입니다' });
    }
    console.log('회원가입2');

    // 3. 회사 코드 검증
    if (!company || !companyCode) {
      return res.status(400).json({ message: "회사명과 회사 코드는 필수입니다." });
    }

    const companyRecord = await prisma.company.findFirst({
      where: {
        companyName: company,
        companyCode: companyCode,
      },
    });

    if (!companyRecord) {
      return res.status(400).json({ message: '기업 인증 실패' });
    }
    console.log('회원가입3');


    // 4. 비밀번호 해시
    const hashedPw = await bcrypt.hash(password, 10);

    console.log('회원가입4');

    //5. 유저생성
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        employeeNumber,
        phoneNumber,
        password: hashedPw,
        companyId: companyRecord.id,
        imageUrl: null,
        isAdmin: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        employeeNumber: true,
        phoneNumber: true,
        imageUrl: true,
        isAdmin: true,
        company: {
          select: {
            companyCode: true,
          },
        },
      },
    });
    console.log('회원가입5');

    return res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '서버 오류' });
  }
});

export default userController;





