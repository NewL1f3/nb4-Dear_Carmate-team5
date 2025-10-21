import * as bcrypt from 'bcrypt';
import { UserRegisterBody } from "./user-types";
import { userRepository } from "./user-repository";



export const userService = {
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
    },






    //////////////////////////////////////////////////////////////////////////////////////////////
    //  ✅ 내 정보 조회

    getMyInfo: async (userId: number) => {

        // DB에서 사용자 조회
        const user = await userRepository.findUserProfileById(userId);


        if (!user) {
            throw new Error("존재하지 않는 유저입니다.");
        }

        return user;
    },








    //////////////////////////////////////////////////////////////////////////////////////////////

    //정보 수정
    async patchMyInfo(
        userId: number,
        data: {
            employeeNumber?: string;
            phoneNumber?: string;
            currentPassword: string;
            password?: string;
            passwordConfirmation?: string;
            imageUrl?: string | null;
        }
    ) {


        // ✅ 유저 존재 확인
        const user = await userRepository.findUserById(userId);
        if (!user) {
            throw new Error("존재하지 않는 유저입니다.");
        }

        // ✅ 현재 비밀번호 확인
        const passwordMatch = await bcrypt.compare(data.currentPassword, user.password);
        if (!passwordMatch) {
            throw new Error("현재 비밀번호가 올바르지 않습니다.");
        }

        // ✅ 새 비밀번호 확인 (선택적)
        let newHashedPassword = user.password;
        if (data.password && data.passwordConfirmation) {
            if (data.password !== data.passwordConfirmation) {
                throw new Error("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
            }
            newHashedPassword = await bcrypt.hash(data.password, 10);
        }

        // 4️⃣ 업데이트 데이터 구성
        const updateData = {
            employeeNumber: data.employeeNumber ?? user.employeeNumber,
            phoneNumber: data.phoneNumber ?? user.phoneNumber,
            password: newHashedPassword,
            imageUrl: data.imageUrl ?? user.imageUrl,
        };

        // 5️⃣ DB 업데이트
        const updatedUser = await userRepository.updateUser(userId, updateData);
        return updatedUser;
    },
};
    