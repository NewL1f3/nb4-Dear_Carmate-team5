import * as bcrypt from 'bcrypt';
import { UserRegisterBody } from "./user-types";
import { userRepository } from "./user-repository";



export const userService =  {
  async register(data: UserRegisterBody) {
      const { name, email, employeeNumber, phoneNumber, password, passwordConfirmation, companyName, companyCode } = data;


      //1.비밀번호 확인
      if (password !== passwordConfirmation) {
         throw new Error("비밀번호와 비밀번호 확인이 일치하지 않습니다");
      }

      //2. 이메일 중복
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        throw new Error("이미 존재하는 이메일입니다.");
      }
      

      // 3. 회사 코드 검증
      if (!companyName || !companyCode) {
        throw new Error("회사명과 회사 코드는 필수입니다.");
      }

      const companyRecord = await userRepository.findCompany(companyName, companyCode)
      if (!companyRecord) {
        throw new Error("기업 인증 실패");
      }


      // 4. 비밀번호 해시
      const hashedPw = await bcrypt.hash(password, 10);


      //5. 유저생성
      const newUser = await userRepository.createUser({
          name,
          email,
          employeeNumber,
          phoneNumber,
          password: hashedPw,
          companyId: companyRecord.id,
          imageUrl: null,
          isAdmin: true,
      });

      // 6️⃣ 회사 영업원 수(userCount) +1
      await userRepository.incrementCompanyUserCount(companyRecord.id);
    
      return newUser;
    }
  }