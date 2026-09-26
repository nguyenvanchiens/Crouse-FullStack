/* Nội dung bài học chương p05 */
window.LESSON_CONTENT = window.LESSON_CONTENT || {};
Object.assign(window.LESSON_CONTENT, {
  "p05.m0.t0": {
    videos: [
      { id: "qgpsIBLvrGY", title: "Password Storage Tier List: encryption, hashing, salting, bcrypt, and beyond", channel: "Studying With Alex", lang: "en", minutes: 10, embed: true }
    ],
    sections: [
      {
        h: "Vì sao không lưu mật khẩu dạng thô hay SHA?",
        p: [
          "Giả sử database bị lộ. Nếu mật khẩu lưu dạng thô, kẻ tấn công có ngay mọi tài khoản, và vì người dùng hay dùng lại mật khẩu, họ còn vào được email, ngân hàng của nạn nhân. Mục tiêu của việc hash mật khẩu là: kể cả khi mất DB, việc khôi phục mật khẩu phải cực kỳ tốn kém.",
          "MD5, SHA-1, SHA-256 là hàm băm nhanh, được thiết kế để băm hàng GB dữ liệu mỗi giây. Chính sự nhanh đó là thảm hoạ với mật khẩu: GPU có thể thử hàng tỉ mật khẩu SHA-256 mỗi giây. Không có salt, kẻ tấn công còn dùng bảng tra sẵn (rainbow table) và phát hiện ngay những người dùng chung một mật khẩu.",
          "Hash mật khẩu cần ba tính chất: một chiều, có salt ngẫu nhiên riêng cho mỗi mật khẩu, và chậm có chủ đích (tốn CPU và bộ nhớ) để việc đoán hàng loạt trở nên đắt đỏ."
        ]
      },
      {
        h: "Argon2id và bcrypt",
        list: [
          "Argon2id: thắng cuộc thi Password Hashing Competition, là lựa chọn ưu tiên của OWASP. Tốn bộ nhớ (memory-hard) nên GPU/ASIC khó tăng tốc. Cấu hình tối thiểu OWASP khuyến nghị: 19 MiB bộ nhớ, 2 vòng lặp, độ song song 1; tăng lên nếu server chịu được.",
          "bcrypt: lâu đời, được hỗ trợ ở mọi nơi. Dùng cost (work factor) từ 10 trở lên. Lưu ý bcrypt chỉ dùng tối đa 72 byte đầu của mật khẩu.",
          "scrypt và PBKDF2 cũng được chấp nhận (PBKDF2 khi cần tuân thủ FIPS), nhưng với dự án Node.js mới, Argon2id là mặc định tốt."
        ],
        p: [
          "Chuỗi hash đầu ra đã chứa thuật toán, tham số và salt (ví dụ `$argon2id$v=19$m=19456,t=2,p=1$...`), nên bạn chỉ cần lưu một cột `password_hash`. Khi tăng tham số, dùng `needsRehash` để hash lại mật khẩu vào lần đăng nhập thành công tiếp theo."
        ],
        code: {
          lang: "typescript",
          file: "password.ts",
          src: `import argon2 from 'argon2';

const OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456, // KiB = 19 MiB
  timeCost: 2,
  parallelism: 1,
};

export function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, OPTIONS); // salt ngẫu nhiên được tạo tự động
}

export async function verifyAndUpgrade(user: { id: number; passwordHash: string }, plain: string) {
  const ok = await argon2.verify(user.passwordHash, plain);
  if (ok && argon2.needsRehash(user.passwordHash, OPTIONS)) {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(plain) },
    });
  }
  return ok;
}`
        }
      },
      {
        h: "Thực hành tốt quanh việc hash",
        p: [
          "Hash chỉ là một phần. NIST SP 800-63B-4 (bản 2025) yêu cầu mật khẩu tối thiểu 15 ký tự khi mật khẩu là yếu tố xác thực duy nhất, và tối thiểu 8 ký tự khi nó chỉ là một phần của MFA; nên cho phép dài ít nhất 64 ký tự. NIST cũng yêu cầu đối chiếu với danh sách mật khẩu phổ biến/đã lộ (ví dụ qua API k-anonymity của Have I Been Pwned) và KHÔNG ép quy tắc thành phần kiểu \"phải có ký tự đặc biệt\".",
          "Hash tốn khoảng vài chục đến vài trăm mili giây là bình thường, nên endpoint đăng nhập cần rate limit để không bị lợi dụng làm DoS. Khi email không tồn tại, vẫn nên trả cùng thông báo lỗi chung để không lộ tài khoản nào có trong hệ thống.",
          "Pepper (một bí mật chung lưu ngoài DB, như trong secret manager) có thể thêm một lớp bảo vệ, nhưng không thay thế salt và thuật toán chậm."
        ]
      }
    ],
    summary: [
      "Không bao giờ lưu mật khẩu thô hoặc băm bằng MD5/SHA-1/SHA-256.",
      "Dùng Argon2id (ưu tiên) hoặc bcrypt: có salt riêng và chậm có chủ đích.",
      "Chuỗi hash chứa sẵn thuật toán, tham số, salt; dùng needsRehash khi nâng tham số.",
      "Kết hợp độ dài tối thiểu, chặn mật khẩu đã lộ và rate limit đăng nhập."
    ],
    pitfalls: [
      "Tự tạo salt rồi `sha256(salt + password)`: vẫn quá nhanh để chống brute-force bằng GPU. Dùng thư viện Argon2id/bcrypt.",
      "So sánh hash bằng `===` trên chuỗi tự tính, có thể lộ thông tin qua thời gian phản hồi. Dùng hàm `verify` của thư viện.",
      "Ghi mật khẩu vào log (log body request đăng nhập). Lọc các trường nhạy cảm khỏi log."
    ],
    quiz: [
      {
        q: "Vì sao SHA-256 không phù hợp để hash mật khẩu?",
        options: [
          "Vì SHA-256 quá nhanh, GPU thử được hàng tỉ lần/giây",
          "Vì SHA-256 có thể giải mã ngược nếu có khoá",
          "Vì SHA-256 cho chuỗi quá dài, khó lưu vào DB",
          "Vì SHA-256 đã bị gỡ khỏi node:crypto"
        ],
        answer: 0,
        explain: "SHA-256 là hàm một chiều, không giải mã được, nhưng nó được thiết kế để nhanh. Hash mật khẩu cần chậm và tốn bộ nhớ có chủ đích như Argon2id."
      },
      {
        q: "Salt trong hash mật khẩu dùng để làm gì?",
        options: [
          "Mã hoá mật khẩu để giải mã được khi cần",
          "Làm hash khác nhau dù mật khẩu giống nhau",
          "Rút ngắn mật khẩu trước khi đưa vào hàm hash",
          "Thay thế cho việc dùng thuật toán hash chậm"
        ],
        answer: 1,
        explain: "Salt ngẫu nhiên khiến kẻ tấn công phải tấn công từng hash riêng lẻ và không nhận ra người dùng trùng mật khẩu. Salt không thay thế được thuật toán chậm."
      },
      {
        q: "Bạn muốn tăng memoryCost của Argon2id cho người dùng cũ. Cách làm hợp lý?",
        options: [
          "Bắt mọi người dùng đổi mật khẩu ngay hôm nay",
          "Giải mã hash cũ ra mật khẩu rồi hash lại",
          "Hash lại khi họ đăng nhập thành công lần tới",
          "Chạy job hash lại chuỗi hash cũ bằng tham số mới"
        ],
        answer: 2,
        explain: "Chỉ lúc đăng nhập bạn mới có mật khẩu gốc để hash lại (kiểm tra bằng needsRehash). Hash không giải mã được; hash chồng lên hash cũ làm phức tạp việc verify; ép đổi mật khẩu gây phiền không cần thiết."
      }
    ]
  },

  "p05.m0.t1": {
    videos: [
      { id: "fyTxwIa-1U0", title: "Session Vs JWT: The Differences You May Not Know!", channel: "ByteByteGo", lang: "en", minutes: 7, embed: true }
    ],
    sections: [
      {
        h: "Stateful session: server nhớ bạn",
        p: [
          "Sau khi đăng nhập, server tạo một session id ngẫu nhiên (ví dụ 32 byte), lưu thông tin phiên (userId, thời điểm tạo, thiết bị) vào Redis hoặc DB, và gửi session id về trình duyệt trong cookie HttpOnly. Mỗi request, server đọc cookie, tra session store để biết bạn là ai.",
          "Ưu điểm lớn nhất là kiểm soát: muốn đăng xuất một thiết bị, khoá tài khoản, hay thu hồi mọi phiên sau khi đổi mật khẩu, chỉ cần xoá bản ghi session. Session id không chứa thông tin gì, lộ ra cũng không lộ dữ liệu. Chi phí: mỗi request thêm một lần tra Redis (thường dưới 1 ms) và cần một store dùng chung giữa các instance."
        ],
        code: {
          lang: "typescript",
          file: "session.ts",
          src: `import { randomBytes } from 'node:crypto';

const SESSION_TTL = 60 * 60 * 24 * 7; // 7 ngày

export async function createSession(userId: number) {
  const sid = randomBytes(32).toString('base64url');
  await redis.set(\`sess:\${sid}\`, JSON.stringify({ userId, createdAt: Date.now() }), 'EX', SESSION_TTL);
  await redis.sadd(\`user-sessions:\${userId}\`, sid); // để thu hồi mọi phiên của user
  return sid;
}

export async function revokeAllSessions(userId: number) {
  const sids = await redis.smembers(\`user-sessions:\${userId}\`);
  if (sids.length) await redis.del(...sids.map((s) => \`sess:\${s}\`));
  await redis.del(\`user-sessions:\${userId}\`);
}`
        }
      },
      {
        h: "Token (JWT): server kiểm tra chữ ký",
        p: [
          "Với JWT, server ký một token chứa thông tin như `sub` (userId), `exp` (hạn). Mỗi request, server chỉ cần kiểm tra chữ ký và hạn, không cần tra DB. Điều này hữu ích khi nhiều service độc lập cần xác thực cùng một người dùng, hoặc khi client là mobile app/ bên thứ ba gọi API bằng header `Authorization: Bearer`.",
          "Cái giá là khó thu hồi: token hợp lệ cho đến khi hết hạn, kể cả khi người dùng đã đăng xuất hay bị khoá. Muốn thu hồi, bạn phải thêm danh sách chặn (denylist) hoặc kiểm tra phiên bản token trong DB, và lúc đó bạn lại quay về có trạng thái. Vì vậy access token JWT nên có hạn ngắn (5–15 phút) đi kèm refresh token."
        ]
      },
      {
        h: "Chọn theo bài toán",
        list: [
          "Web app truyền thống hoặc SPA cùng domain với API: session cookie là lựa chọn đơn giản và an toàn, dễ thu hồi.",
          "Mobile app, API cho bên thứ ba, nhiều service cần xác thực độc lập: access token ngắn hạn + refresh token.",
          "SPA gọi API khác domain hoặc cần đăng nhập qua OAuth: cân nhắc mô hình BFF (Backend for Frontend) giữ token phía server và dùng session cookie với trình duyệt.",
          "Đừng lưu JWT trong `localStorage` chỉ vì \"stateless\": bất kỳ đoạn script XSS nào cũng đọc được."
        ],
        p: [
          "Stateless không miễn phí: bạn đổi khả năng kiểm soát lấy việc bớt một lần tra cứu. Với đa số sản phẩm, lần tra Redis đó rẻ hơn nhiều so với rủi ro không thu hồi được phiên."
        ]
      }
    ],
    summary: [
      "Session: server lưu trạng thái, cookie chỉ chứa id ngẫu nhiên; thu hồi dễ bằng cách xoá bản ghi.",
      "JWT: tự chứa thông tin, xác thực bằng chữ ký, không cần tra DB nhưng khó thu hồi.",
      "Access token JWT nên ngắn hạn, đi kèm refresh token có thể thu hồi.",
      "Web app cùng domain: session cookie thường là lựa chọn tốt nhất."
    ],
    pitfalls: [
      "Dùng JWT hạn 30 ngày không có cơ chế thu hồi: tài khoản bị chiếm vẫn dùng được token cả tháng. Hạn ngắn + refresh token.",
      "Không tạo lại session id sau khi đăng nhập, dễ bị session fixation. Luôn cấp session id mới khi đăng nhập hoặc nâng quyền.",
      "Sinh session id bằng `Math.random()` hay id tăng dần, có thể đoán được. Dùng `crypto.randomBytes` tối thiểu 128 bit."
    ],
    quiz: [
      {
        q: "Ưu điểm chính của stateful session so với JWT là gì?",
        options: [
          "Không cần lưu trữ gì ở phía server",
          "Nhanh hơn JWT trong mọi trường hợp",
          "Không cần dùng cookie hay header",
          "Thu hồi phiên ngay bằng cách xoá bản ghi"
        ],
        answer: 3,
        explain: "Server nắm trạng thái nên xoá session là phiên mất hiệu lực ngay. Session cần store ở server và thường dùng cookie."
      },
      {
        q: "Vì sao access token JWT nên có thời hạn ngắn?",
        options: [
          "Vì JWT khó thu hồi, hạn ngắn thu hẹp thiệt hại",
          "Vì token có exp xa sẽ không ký được bằng HS256",
          "Vì trình duyệt tự xoá JWT sau 15 phút",
          "Vì RFC 7519 bắt buộc exp tối đa 15 phút"
        ],
        answer: 0,
        explain: "Server không tra DB khi xác thực JWT nên không biết token đã bị thu hồi, hạn ngắn làm cửa sổ rủi ro nhỏ. Chuẩn JWT không quy định thời hạn cụ thể."
      },
      {
        q: "Phát biểu nào đúng về session id?",
        options: [
          "Nên chứa userId để server khỏi tra cứu store",
          "Là chuỗi ngẫu nhiên, cấp mới mỗi lần đăng nhập",
          "Có thể dùng id tăng dần vì đã có HttpOnly",
          "Nên lưu trong localStorage để gửi qua header"
        ],
        answer: 1,
        explain: "Session id phải không đoán được và không mang dữ liệu; tạo mới khi đăng nhập để chống session fixation. Nên lưu trong cookie HttpOnly thay vì localStorage."
      }
    ]
  },

  "p05.m0.t2": {
    videos: [
      { id: "XwQ-wxfCeJs", title: "1. Bạn Đã Thật Sự Hiểu JWT và Cơ Chế Refresh Token Tự Động Chưa? | TrungQuanDev", channel: "TrungQuanDev - Một Lập Trình Viên", lang: "vi", minutes: 19, embed: true },
      { id: "s-4k5TcGKHg", title: "Refresh Token Rotation and Reuse Detection in Node.js JWT Authentication", channel: "Dave Gray", lang: "en", minutes: 35, embed: true }
    ],
    sections: [
      {
        h: "Cấu trúc của JWT",
        p: [
          "JWT gồm ba phần mã hoá base64url, nối bằng dấu chấm: `header.payload.signature`. Header cho biết thuật toán (`alg`, ví dụ HS256, RS256, EdDSA). Payload chứa các claim: `sub` (chủ thể), `exp` (hết hạn), `iat` (thời điểm tạo), `iss` (bên phát hành), `aud` (bên nhận), `jti` (id token). Signature là chữ ký trên header và payload.",
          "Điều quan trọng nhất: payload chỉ được mã hoá base64url, KHÔNG được mã hoá bí mật. Ai có token cũng đọc được nội dung. Đừng đặt mật khẩu, số CMND hay dữ liệu nhạy cảm vào JWT. Chữ ký chỉ đảm bảo nội dung không bị sửa.",
          "HS256 dùng một secret chung để ký và kiểm tra, hợp khi chỉ một service vừa phát hành vừa kiểm tra. RS256/ES256/EdDSA dùng cặp khoá: auth server ký bằng private key, các service khác kiểm tra bằng public key (thường công bố qua JWKS), không service nào khác ký được token."
        ]
      },
      {
        h: "Ký và xác thực đúng cách",
        p: [
          "Khi xác thực, luôn cố định danh sách thuật toán chấp nhận, và kiểm tra `exp`, `iss`, `aud`. Các lỗ hổng kinh điển đến từ việc tin vào `alg` trong header: token với `alg: none`, hoặc đổi RS256 thành HS256 để dùng public key làm secret."
        ],
        code: {
          lang: "typescript",
          file: "tokens.ts",
          src: `import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET); // ≥ 32 byte ngẫu nhiên
const ISSUER = 'https://api.devpath.vn';
const AUDIENCE = 'devpath-web';

export function signAccessToken(userId: string, roles: string[]) {
  return new SignJWT({ roles })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(secret);
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ['HS256'], // không bao giờ chấp nhận thuật toán khác
    issuer: ISSUER,
    audience: AUDIENCE,
  });
  return payload; // exp được kiểm tra tự động
}`
        }
      },
      {
        h: "Refresh token rotation và phát hiện tái sử dụng",
        p: [
          "Access token ngắn hạn (5–15 phút) đi kèm refresh token dài hạn hơn (vài ngày đến vài tuần). Refresh token là chuỗi ngẫu nhiên (không cần là JWT), server lưu dạng hash trong DB để có thể thu hồi.",
          "Rotation: mỗi lần dùng refresh token để lấy access token mới, server cấp một refresh token mới và vô hiệu hoá cái cũ. Các token nối tiếp nhau thuộc cùng một \"family\".",
          "Phát hiện tái sử dụng: nếu một refresh token đã dùng rồi lại được gửi lên, nghĩa là nó đã bị đánh cắp (hoặc người dùng thật đang dùng bản cũ). Server thu hồi toàn bộ family, buộc đăng nhập lại. Kẻ trộm chỉ dùng được đến lần xoay tiếp theo của người dùng thật.",
          "Chú ý race condition: hai tab cùng gửi một refresh token gần như đồng thời. Bước đánh dấu \"đã dùng\" phải là UPDATE có điều kiện (`WHERE used_at IS NULL`) để chỉ một request thắng. Một số hệ thống còn cho khoảng ân hạn vài giây với token vừa xoay để tránh đăng xuất nhầm người dùng thật; đó là đánh đổi giữa trải nghiệm và độ chặt."
        ],
        code: {
          lang: "typescript",
          file: "refresh.ts",
          src: `import { createHash, randomBytes } from 'node:crypto';
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export async function rotateRefreshToken(presented: string) {
  const record = await db.refreshToken.findUnique({ where: { tokenHash: sha256(presented) } });
  if (!record || record.expiresAt < new Date()) throw new UnauthorizedException();

  if (record.usedAt || record.revokedAt) {
    // Token đã dùng hoặc đã bị thu hồi mà vẫn được gửi lại: nghi bị đánh cắp, thu hồi cả family
    await db.refreshToken.updateMany({ where: { familyId: record.familyId }, data: { revokedAt: new Date() } });
    throw new UnauthorizedException('Refresh token reuse detected');
  }

  const next = randomBytes(32).toString('base64url');
  await db.$transaction(async (tx) => {
    // Đánh dấu "đã dùng" có điều kiện: hai request đồng thời cùng token thì chỉ một bên thắng
    const claimed = await tx.refreshToken.updateMany({
      where: { id: record.id, usedAt: null, revokedAt: null },
      data: { usedAt: new Date() },
    });
    if (claimed.count === 0) throw new UnauthorizedException('Refresh token reuse detected');
    await tx.refreshToken.create({
      data: { tokenHash: sha256(next), familyId: record.familyId, userId: record.userId,
              expiresAt: new Date(Date.now() + 14 * 864e5) }, // 864e5 ms = 1 ngày
    });
  });
  return { refreshToken: next, accessToken: await signAccessToken(String(record.userId), []) };
}`
        }
      }
    ],
    summary: [
      "JWT = header.payload.signature; payload chỉ base64url, ai cũng đọc được.",
      "Cố định thuật toán khi verify và kiểm tra exp, iss, aud; không tin `alg` trong header.",
      "HS256 cho một service; RS256/ES256/EdDSA khi nhiều service cần kiểm tra bằng public key.",
      "Access token ngắn hạn + refresh token lưu dạng hash, xoay vòng và thu hồi cả family khi phát hiện tái sử dụng."
    ],
    pitfalls: [
      "Đặt dữ liệu nhạy cảm vào payload JWT vì tưởng nó được mã hoá. Chỉ đặt định danh và quyền tối thiểu.",
      "Dùng secret yếu như `secret123` cho HS256, có thể bị brute-force offline từ một token. Dùng tối thiểu 256 bit ngẫu nhiên từ secret manager.",
      "Lưu refresh token dạng thô trong DB: lộ DB là lộ mọi phiên. Lưu hash."
    ],
    quiz: [
      {
        q: "Phát biểu nào đúng về payload của JWT đã ký (JWS)?",
        options: [
          "Được mã hoá bằng secret nên không ai đọc được",
          "Chỉ server giữ private key mới giải mã được",
          "Ai có token đều đọc được, chữ ký chỉ chống sửa",
          "Tự động bị trình duyệt xoá khi hết hạn exp"
        ],
        answer: 2,
        explain: "Base64url là mã hoá hiển thị, không phải mã hoá bí mật. Muốn giấu nội dung cần JWE, nhưng cách tốt hơn là không đặt dữ liệu nhạy cảm vào token."
      },
      {
        q: "Refresh token đã dùng trước đó lại được gửi lên. Server nên làm gì theo cơ chế reuse detection?",
        options: [
          "Cấp access token mới như bình thường",
          "Gia hạn token đó thêm một chu kỳ",
          "Bỏ qua lỗi và trả 200 rỗng",
          "Thu hồi cả family, buộc đăng nhập lại"
        ],
        answer: 3,
        explain: "Token cũ bị dùng lại là dấu hiệu bị đánh cắp. Thu hồi cả family vô hiệu hoá cả token của kẻ trộm lẫn chuỗi hiện tại."
      },
      {
        q: "Vì sao phải truyền `algorithms: ['HS256']` khi verify?",
        options: [
          "Để không tin alg do token tự khai trong header",
          "Để thư viện bỏ qua bước so chữ ký cho nhanh",
          "Vì jwtVerify báo lỗi nếu thiếu tham số này",
          "Để token sinh ra ngắn hơn khi ký"
        ],
        answer: 0,
        explain: "Header do client gửi lên nên không đáng tin. Cố định thuật toán (RFC 8725) ngăn các tấn công như alg: none hay nhầm lẫn RS256/HS256. Tham số này không bắt buộc về cú pháp trong jose và không làm token ngắn đi."
      }
    ]
  },

  "p05.m0.t3": {
    videos: [
      { id: "LvlUsIwYLW4", title: "Cookie là gì? Tìm hiểu Cookie hoạt động HTTPOnly, Secure với EXPRESS NODEJS", channel: "Tips Javascript", lang: "vi", minutes: 21, embed: true },
      { id: "aUF2QCEudPo", title: "SameSite Cookie Attribute Explained by Example (Strict, Lax, None & No SameSite)", channel: "Hussein Nasser", lang: "en", minutes: 14, embed: true }
    ],
    sections: [
      {
        h: "Các thuộc tính bảo vệ cookie",
        list: [
          "`HttpOnly`: JavaScript trên trang không đọc được cookie qua `document.cookie`. Nếu có lỗ hổng XSS, kẻ tấn công không lấy trộm được session id. Luôn bật cho cookie xác thực.",
          "`Secure`: chỉ gửi qua HTTPS, không lộ trên mạng Wi-Fi công cộng.",
          "`SameSite`: kiểm soát việc gửi cookie trong request từ site khác. `Strict` không bao giờ gửi cross-site; `Lax` gửi khi người dùng điều hướng cấp cao nhất bằng GET (bấm link), chặn POST từ site khác; `None` luôn gửi và bắt buộc có `Secure`. Chrome coi cookie không khai báo SameSite là `Lax` (kèm ngoại lệ cho POST cấp cao nhất trong 2 phút đầu sau khi cookie được đặt), còn trình duyệt khác chưa chắc làm vậy, nên luôn khai báo SameSite tường minh.",
          "`Domain` và `Path`: phạm vi gửi cookie. Không đặt `Domain` thì cookie chỉ gửi tới đúng host đã tạo nó, an toàn hơn so với chia sẻ cho mọi subdomain.",
          "`Max-Age`/`Expires`: thời hạn. Không có hai thuộc tính này là session cookie, mất khi đóng trình duyệt (dù nhiều trình duyệt khôi phục phiên)."
        ],
        p: [
          "Mỗi thuộc tính chặn một loại tấn công khác nhau. Cookie xác thực nên có đủ HttpOnly, Secure, SameSite và thời hạn hợp lý."
        ]
      },
      {
        h: "Tiền tố __Host- và __Secure-",
        p: [
          "Trình duyệt áp quy tắc đặc biệt với tên cookie có tiền tố. Cookie `__Secure-` phải có `Secure` và được đặt từ HTTPS. Cookie `__Host-` chặt hơn: phải có `Secure`, `Path=/` và không được có `Domain`.",
          "Tác dụng thực tế: một subdomain bị chiếm (ví dụ `blog.example.com`) không thể ghi đè cookie `__Host-sid` của `app.example.com`, vì cookie `__Host-` bị khoá vào đúng host. Đây là cách rẻ để chống cookie tossing và session fixation qua subdomain."
        ],
        code: {
          lang: "typescript",
          file: "auth.controller.ts",
          src: `import type { Response } from 'express';

export function setSessionCookie(res: Response, sid: string) {
  res.cookie('__Host-sid', sid, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // Express tính maxAge bằng mili giây
    // không đặt domain: bắt buộc với tiền tố __Host-
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie('__Host-sid', { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
}`
        }
      },
      {
        h: "Chọn thời hạn và các lưu ý",
        p: [
          "Thời hạn là đánh đổi giữa tiện lợi và rủi ro. Ứng dụng ngân hàng có thể hết hạn sau 15 phút không hoạt động; mạng xã hội có thể giữ vài tuần với \"ghi nhớ đăng nhập\". Hãy kết hợp idle timeout (không hoạt động) và absolute timeout (tối đa kể từ khi đăng nhập) ở phía server, vì thời hạn cookie chỉ là gợi ý cho trình duyệt.",
          "Khi đăng xuất, xoá cả session trên server lẫn cookie trên trình duyệt. Để xoá cookie, phải gửi lại cùng tên, `Path` và `Domain` như lúc tạo. Ở môi trường dev chạy `http://localhost`, Chrome và Firefox coi localhost là ngữ cảnh an toàn nên vẫn nhận cookie `Secure`; Safari có thể không, nên nếu gặp lỗi đăng nhập ở dev, hãy chạy dev server bằng HTTPS (ví dụ chứng chỉ tự ký qua mkcert)."
        ]
      }
    ],
    summary: [
      "HttpOnly chống đọc cookie bằng JavaScript; Secure chỉ gửi qua HTTPS.",
      "SameSite=Lax là mặc định hợp lý cho cookie phiên; None phải kèm Secure.",
      "__Host- buộc Secure, Path=/, không Domain, chống ghi đè cookie từ subdomain.",
      "Kết hợp idle timeout và absolute timeout ở server; đăng xuất phải xoá cả hai phía."
    ],
    pitfalls: [
      "Đặt `Domain=.example.com` cho cookie phiên, mọi subdomain (kể cả dịch vụ bên thứ ba) đều nhận được cookie. Không đặt Domain nếu không cần.",
      "Dùng `SameSite=None` để \"cho chạy được\" mà không hiểu hệ quả, mở lại rủi ro CSRF. Chỉ dùng khi thật sự cần cookie cross-site và có CSRF token.",
      "Xoá cookie với Path khác lúc tạo, cookie không bị xoá và người dùng vẫn đăng nhập."
    ],
    quiz: [
      {
        q: "Thuộc tính nào ngăn JavaScript đọc cookie phiên khi có lỗ hổng XSS?",
        options: ["Secure", "HttpOnly", "SameSite", "Path"],
        answer: 1,
        explain: "HttpOnly ẩn cookie khỏi document.cookie. Secure chỉ liên quan HTTPS; SameSite liên quan request cross-site; Path giới hạn đường dẫn."
      },
      {
        q: "Cookie tên `__Host-sid` bắt buộc những điều kiện nào?",
        options: [
          "Có Domain và HttpOnly",
          "Có SameSite=Strict và HttpOnly",
          "Có Secure, Path=/, không có Domain",
          "Không có Max-Age và Expires"
        ],
        answer: 2,
        explain: "Đó là quy tắc của tiền tố __Host-. HttpOnly và SameSite vẫn nên đặt nhưng không phải điều kiện bắt buộc của tiền tố."
      },
      {
        q: "Với `SameSite=Lax`, trường hợp nào cookie VẪN được gửi từ site khác?",
        options: [
          "Form POST tự submit từ trang kẻ tấn công",
          "Iframe trên site khác nhúng trang của bạn",
          "Request fetch() chạy nền từ site khác",
          "Người dùng bấm link GET sang trang của bạn"
        ],
        answer: 3,
        explain: "Lax cho phép gửi cookie khi điều hướng cấp cao nhất bằng phương thức an toàn như GET, để người dùng bấm link vẫn đăng nhập. POST, fetch và iframe cross-site không nhận cookie."
      }
    ]
  },

  "p05.m0.t4": {
    videos: [
      { id: "5FrA0UzV1Aw", title: "OAuth is Broken Without This | Meet PKCE", channel: "ByteMonk", lang: "en", minutes: 10, embed: true }
    ],
    sections: [
      {
        h: "OAuth 2.0 giải quyết bài toán gì?",
        p: [
          "OAuth 2.0 là giao thức ủy quyền: cho phép một ứng dụng (client) truy cập tài nguyên của người dùng ở một hệ thống khác mà không cần biết mật khẩu của họ. Ví dụ: ứng dụng quản lý lịch xin quyền đọc Google Calendar của bạn.",
          "Các vai trò: Resource Owner (người dùng), Client (ứng dụng của bạn), Authorization Server (cấp token, ví dụ Google, Keycloak, Auth0), Resource Server (API chứa dữ liệu). Kết quả cuối cùng là access token có phạm vi (scope) giới hạn.",
          "Lưu ý: OAuth 2.0 là ủy quyền (authorization), không phải xác thực danh tính. Việc \"đăng nhập bằng Google\" dùng OpenID Connect, một lớp xây trên OAuth."
        ]
      },
      {
        h: "Authorization Code + PKCE",
        p: [
          "Đây là flow được khuyến nghị cho mọi client có người dùng: web server, SPA, mobile. Implicit flow (trả token thẳng trên URL) không còn được khuyến nghị vì token dễ lộ qua lịch sử trình duyệt, log và header Referer. RFC 9700 (OAuth 2.0 Security Best Current Practice, 01/2025) đã chính thức khuyến nghị không dùng implicit (SHOULD NOT), cấm password grant (MUST NOT), bắt buộc PKCE cho client công khai (SPA, mobile) và khuyến nghị PKCE cho cả client bí mật. OAuth 2.1 (vẫn đang là bản nháp IETF) gom các quy tắc đó thành chuẩn mới.",
          "Hai loại client: confidential client (backend của bạn, giữ được `client_secret` an toàn) và public client (SPA, mobile app: mọi thứ trong code đều bị đọc được, nên không có secret). PKCE thay thế vai trò của secret cho public client ở bước đổi code."
        ],
        list: [
          "Client sinh `code_verifier` ngẫu nhiên (43–128 ký tự) và tính `code_challenge = BASE64URL(SHA256(code_verifier))`.",
          "Chuyển hướng người dùng tới authorization endpoint với `response_type=code`, `client_id`, `redirect_uri`, `scope`, `state` ngẫu nhiên, `code_challenge` và `code_challenge_method=S256`.",
          "Người dùng đăng nhập và đồng ý; server chuyển hướng về `redirect_uri?code=...&state=...`. Client kiểm tra `state` khớp giá trị đã lưu.",
          "Client gửi `code` cùng `code_verifier` tới token endpoint. Server băm verifier, so với challenge ban đầu rồi mới cấp token. Kẻ chặn được `code` cũng không đổi được token vì không có verifier."
        ],
        code: {
          lang: "typescript",
          file: "pkce.ts",
          src: `import { createHash, randomBytes } from 'node:crypto';

export function createPkcePair() {
  const verifier = randomBytes(32).toString('base64url'); // 43 ký tự
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

export function buildAuthorizeUrl(state: string, challenge: string) {
  const url = new URL('https://auth.example.com/oauth2/authorize');
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.OAUTH_CLIENT_ID!,
    redirect_uri: 'https://app.devpath.vn/auth/callback',
    scope: 'openid profile email',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  }).toString();
  return url.toString();
}`
        }
      },
      {
        h: "Client credentials cho service-to-service",
        p: [
          "Khi không có người dùng, ví dụ service báo cáo gọi service đơn hàng lúc 2 giờ sáng, dùng client credentials: service xác thực bằng `client_id` và `client_secret` (hoặc private key JWT, mTLS) để lấy access token với scope của chính nó.",
          "Token nên ngắn hạn và được cache đến gần lúc hết hạn. Mỗi service có client riêng với scope tối thiểu, để khi một secret bị lộ, bạn thu hồi đúng client đó mà không ảnh hưởng hệ thống khác."
        ],
        code: {
          lang: "bash",
          file: "client-credentials.sh",
          src: `curl -X POST https://auth.example.com/oauth2/token \\
  -u "report-service:$CLIENT_SECRET" \\
  -d grant_type=client_credentials \\
  -d scope=orders:read`
        }
      }
    ],
    summary: [
      "OAuth 2.0 là ủy quyền truy cập tài nguyên, không phải giao thức đăng nhập.",
      "SPA/mobile/web dùng Authorization Code + PKCE; implicit và password grant không còn khuyến nghị (RFC 9700).",
      "PKCE: code_challenge = BASE64URL(SHA256(code_verifier)); code bị chặn cũng vô dụng khi thiếu verifier.",
      "`state` chống CSRF trong flow đăng nhập; client credentials cho service-to-service."
    ],
    pitfalls: [
      "Không kiểm tra `state` ở callback, kẻ tấn công có thể gắn phiên của bạn với tài khoản của họ (login CSRF).",
      "Cho phép `redirect_uri` tuỳ ý hoặc so khớp lỏng (prefix, wildcard), code bị chuyển tới domain kẻ tấn công. Đăng ký và so khớp chính xác.",
      "Nhúng `client_secret` vào code SPA/mobile: ai cũng trích xuất được. Client công khai dùng PKCE, không dùng secret."
    ],
    quiz: [
      {
        q: "Flow nào được khuyến nghị cho SPA hiện nay?",
        options: ["Authorization Code + PKCE", "Resource Owner Password Credentials", "Implicit flow", "Client credentials"],
        answer: 0,
        explain: "Authorization Code + PKCE không lộ token trên URL và chống đánh cắp code. Implicit không còn khuyến nghị; password grant buộc client cầm mật khẩu; client credentials dành cho máy với máy."
      },
      {
        q: "PKCE bảo vệ khỏi nguy cơ nào?",
        options: [
          "SQL injection ở token endpoint",
          "Code bị chặn rồi đem đổi lấy token",
          "Người dùng đặt mật khẩu yếu ở IdP",
          "DDoS vào authorization endpoint"
        ],
        answer: 1,
        explain: "Chỉ client ban đầu có code_verifier; kẻ chặn được code không thể hoàn tất bước đổi token."
      },
      {
        q: "Service A cần gọi API của service B theo lịch, không có người dùng. Dùng grant nào?",
        options: ["Authorization Code + PKCE", "Implicit", "Client credentials", "Device code"],
        answer: 2,
        explain: "Client credentials dành cho client tự xác thực chính nó khi không có người dùng. Các flow khác cần người dùng tương tác."
      }
    ]
  },

  "p05.m0.t5": {
    videos: [
      { id: "5KChrGWFcpk", title: "Single Sign-On (SSO) Explained in 10 Minutes | SAML, OIDC & SCIM", channel: "ByteMonk", lang: "en", minutes: 8, embed: true },
      { id: "t18YB3xDfXI", title: "An Illustrated Guide to OAuth and OpenID Connect", channel: "OktaDev", lang: "en", minutes: 17, embed: true }
    ],
    sections: [
      {
        h: "OpenID Connect: lớp danh tính trên OAuth",
        p: [
          "OAuth cho bạn access token để gọi API, nhưng không chuẩn hoá cách biết \"người dùng là ai\". OpenID Connect (OIDC) bổ sung điều đó: khi scope có `openid`, token endpoint trả thêm ID token, một JWT mô tả người dùng và phiên đăng nhập.",
          "ID token dành cho client đọc, không dùng để gọi API. Các claim chính: `iss` (nhà cung cấp), `sub` (định danh người dùng duy nhất và cố định trong phạm vi issuer đó), `aud` (phải là client_id của bạn), `exp`, `iat`, `nonce` (chống replay, phải khớp giá trị client gửi lúc bắt đầu), cùng các thông tin như `email`, `email_verified`, `name`."
        ]
      },
      {
        h: "Discovery, JWKS và kiểm tra ID token",
        p: [
          "Mỗi nhà cung cấp OIDC công bố tài liệu discovery tại `<issuer>/.well-known/openid-configuration`, liệt kê authorization endpoint, token endpoint, userinfo endpoint và `jwks_uri` (các public key dùng để ký token). Thư viện client đọc tài liệu này nên bạn chỉ cần cấu hình issuer.",
          "Khi nhận ID token, phải kiểm tra chữ ký bằng JWKS, `iss`, `aud`, `exp` và `nonce`. Định danh người dùng bằng cặp (`iss`, `sub`), không phải bằng email, vì email có thể thay đổi hoặc chưa được xác minh."
        ],
        code: {
          lang: "typescript",
          file: "oidc.ts",
          src: `import { createRemoteJWKSet, jwtVerify } from 'jose';

// Google tài liệu hoá hai giá trị iss hợp lệ
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
const jwks = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

export async function verifyGoogleIdToken(idToken: string, expectedNonce: string) {
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: GOOGLE_ISSUERS,
    audience: process.env.GOOGLE_CLIENT_ID!,
    algorithms: ['RS256'],
  });
  // jose không tự kiểm tra nonce: phải so với giá trị đã lưu lúc bắt đầu đăng nhập
  if (!expectedNonce || payload.nonce !== expectedNonce) throw new Error('Invalid nonce');
  return payload;
}

// Liên kết tài khoản theo (provider, sub), không theo email
export async function findOrCreateUser(p: { sub: string; email?: string; email_verified?: boolean }) {
  const identity = await db.identity.findUnique({
    where: { provider_subject: { provider: 'google', subject: p.sub } },
    include: { user: true },
  });
  if (identity) return identity.user;
  if (!p.email || !p.email_verified) throw new Error('Email chưa được xác minh');
  return db.user.create({
    data: { email: p.email, identities: { create: { provider: 'google', subject: p.sub } } },
  });
}`
        }
      },
      {
        h: "SSO trong doanh nghiệp và SAML",
        p: [
          "SSO (Single Sign-On) cho phép đăng nhập một lần và dùng nhiều ứng dụng. Với người dùng phổ thông, \"Đăng nhập bằng Google/GitHub\" giảm ma sát đăng ký và chuyển trách nhiệm bảo vệ mật khẩu cho nhà cung cấp lớn. Lưu ý GitHub chủ yếu cung cấp OAuth 2.0 cho đăng nhập người dùng, nên bạn lấy thông tin qua API user thay vì ID token.",
          "Khách hàng doanh nghiệp thường yêu cầu tích hợp với Identity Provider của họ (Microsoft Entra ID, Okta, Google Workspace). Nhiều hệ thống cũ dùng SAML 2.0: trao đổi assertion dạng XML có chữ ký qua trình duyệt. SAML phức tạp và từng có nhiều lỗ hổng do xử lý chữ ký XML, nên hãy dùng thư viện đã được kiểm chứng hoặc dịch vụ như Keycloak, Auth0, WorkOS thay vì tự viết.",
          "Khi hỗ trợ SSO doanh nghiệp, cân nhắc thêm SCIM để IdP tự tạo và vô hiệu hoá tài khoản khi nhân viên vào hoặc nghỉ việc."
        ]
      }
    ],
    summary: [
      "OIDC thêm ID token (JWT) lên OAuth 2.0 để xác thực danh tính người dùng.",
      "Kiểm tra chữ ký qua JWKS, iss, aud, exp và nonce của ID token.",
      "Định danh người dùng bằng (iss, sub), không bằng email.",
      "Discovery `/.well-known/openid-configuration` giúp client tự cấu hình.",
      "SAML phổ biến trong doanh nghiệp; dùng thư viện hoặc dịch vụ đã kiểm chứng."
    ],
    pitfalls: [
      "Dùng ID token làm bearer token gọi API: ID token có `aud` là client, không phải API. Dùng access token cho API.",
      "Tự động gộp tài khoản theo email từ provider mà không kiểm tra `email_verified`, dẫn tới chiếm tài khoản. Chỉ liên kết khi email đã xác minh và tốt nhất là yêu cầu người dùng xác nhận.",
      "Chỉ decode ID token mà không verify chữ ký. Luôn verify bằng JWKS của issuer."
    ],
    quiz: [
      {
        q: "Claim nào nên dùng để định danh người dùng đăng nhập qua OIDC?",
        options: ["email", "name", "picture", "Cặp iss và sub"],
        answer: 3,
        explain: "sub là duy nhất và cố định trong phạm vi một issuer. Email có thể đổi, bị tái sử dụng hoặc chưa xác minh; name và picture không duy nhất."
      },
      {
        q: "Tài liệu discovery của OIDC nằm ở đâu?",
        options: [
          "<issuer>/.well-known/openid-configuration",
          "<issuer>/oauth2/token",
          "<issuer>/userinfo",
          "<issuer>/.well-known/jwks.json"
        ],
        answer: 0,
        explain: "Đường dẫn chuẩn là /.well-known/openid-configuration dưới issuer, chứa các endpoint và jwks_uri. Token endpoint, userinfo và địa chỉ JWKS được liệt kê TRONG tài liệu discovery, đường dẫn cụ thể tuỳ nhà cung cấp."
      },
      {
        q: "Mục đích của `nonce` trong OIDC?",
        options: [
          "Làm khoá để mã hoá nội dung ID token",
          "Gắn ID token với đúng lượt đăng nhập, chống replay",
          "Chứa mật khẩu dùng một lần cho người dùng",
          "Xác định thời điểm ID token hết hạn"
        ],
        answer: 1,
        explain: "Client tạo nonce ngẫu nhiên khi bắt đầu, IdP đưa nó vào ID token, client kiểm tra khớp. Thời hạn nằm ở exp; nonce không mã hoá gì."
      }
    ]
  },

  "p05.m0.t6": {
    videos: [
      { id: "46AKWNOJ3-Y", title: "How HOTP and TOTP work", channel: "loops", lang: "en", minutes: 4, embed: true }
    ],
    sections: [
      {
        h: "MFA và TOTP hoạt động thế nào?",
        p: [
          "MFA (xác thực đa yếu tố) yêu cầu thêm một yếu tố ngoài mật khẩu: thứ bạn có (điện thoại, khoá bảo mật) hoặc thứ bạn là (sinh trắc học). Mật khẩu bị lộ qua phishing hay rò rỉ dữ liệu cũng chưa đủ để vào tài khoản.",
          "TOTP (RFC 6238) là mã 6 số trong Google Authenticator, Authy. Khi bật MFA, server sinh một secret ngẫu nhiên, hiển thị dạng QR (URI `otpauth://totp/...`) để app quét. Sau đó cả server và app cùng tính `HMAC(secret, floor(thời_gian / 30 giây))` rồi rút gọn thành 6 chữ số. Không cần mạng giữa hai bên, chỉ cần đồng hồ gần đúng.",
          "SMS OTP tiện nhưng yếu hơn (SIM swap, chặn tin nhắn). Passkey/WebAuthn mạnh nhất vì chống phishing: khoá gắn với domain nên trang giả không dùng được."
        ],
        code: {
          lang: "typescript",
          file: "totp.ts",
          src: `import { createHmac, timingSafeEqual } from 'node:crypto';

function hotp(secret: Buffer, counter: bigint, digits = 6): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(counter);
  const h = createHmac('sha1', secret).update(msg).digest();
  const offset = h[h.length - 1] & 0x0f;
  const bin = ((h[offset] & 0x7f) << 24) | (h[offset + 1] << 16) | (h[offset + 2] << 8) | h[offset + 3];
  return String(bin % 10 ** digits).padStart(digits, '0');
}

// Chấp nhận lệch ±1 bước (30s) để bù sai lệch đồng hồ
export function verifyTotp(secret: Buffer, code: string, now = Date.now()): bigint | null {
  const step = BigInt(Math.floor(now / 1000 / 30));
  for (const drift of [-1n, 0n, 1n]) {
    const expected = hotp(secret, step + drift);
    if (code.length === expected.length && timingSafeEqual(Buffer.from(code), Buffer.from(expected))) {
      return step + drift; // lưu lại để chặn dùng lại cùng mã
    }
  }
  return null;
}`
        }
      },
      {
        h: "Triển khai MFA an toàn",
        list: [
          "Mã hoá secret TOTP khi lưu (khác với mật khẩu, server cần đọc lại secret nên không hash được).",
          "Chỉ kích hoạt MFA sau khi người dùng nhập đúng một mã đầu tiên, để chắc họ đã quét QR thành công.",
          "Chặn dùng lại: lưu bước thời gian đã dùng gần nhất và từ chối mã của cùng bước hoặc bước cũ hơn.",
          "Rate limit ô nhập mã: 6 chữ số chỉ có 1 triệu khả năng.",
          "Cấp mã khôi phục (recovery code) dùng một lần, lưu dạng hash, để người dùng mất điện thoại vẫn vào được."
        ],
        p: [
          "Đây cũng là những điểm hay bị bỏ sót nhất khi tự triển khai MFA."
        ]
      },
      {
        h: "Luồng quên mật khẩu",
        p: [
          "Token reset mật khẩu thực chất là một mật khẩu tạm thời, nên phải được bảo vệ tương xứng: sinh ngẫu nhiên từ CSPRNG (tối thiểu 128 bit), chỉ dùng một lần, có hạn ngắn (ví dụ 15–60 phút), và lưu dạng hash trong DB. Vì token có entropy cao, SHA-256 là đủ để hash nó (khác với mật khẩu người dùng đặt).",
          "Luôn trả cùng một thông báo \"Nếu email tồn tại, chúng tôi đã gửi hướng dẫn\" để không lộ email nào đã đăng ký; thời gian phản hồi cũng phải tương đương, nên thực tế hãy đẩy việc gửi email vào queue thay vì `await` gửi ngay trong request như ví dụ rút gọn bên dưới. Sau khi đặt lại thành công: vô hiệu hoá token, thu hồi mọi session và refresh token đang có, gửi email thông báo mật khẩu đã đổi. Link reset phải dùng domain cố định trong cấu hình, không lấy từ header `Host` của request."
        ],
        code: {
          lang: "typescript",
          file: "password-reset.ts",
          src: `import { createHash, randomBytes } from 'node:crypto';
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export async function requestReset(email: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (user) {
    const token = randomBytes(32).toString('base64url');
    await db.passwordReset.create({
      data: { userId: user.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + 30 * 60_000) },
    });
    await mailer.send(email, \`\${process.env.APP_URL}/reset?token=\${token}\`);
  }
  return { message: 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.' };
}

export async function resetPassword(token: string, newPassword: string) {
  const rec = await db.passwordReset.findUnique({ where: { tokenHash: sha256(token) } });
  if (!rec || rec.usedAt || rec.expiresAt < new Date()) throw new BadRequestException('Link không hợp lệ hoặc đã hết hạn');
  await db.$transaction([
    db.user.update({ where: { id: rec.userId }, data: { passwordHash: await hashPassword(newPassword) } }),
    db.passwordReset.update({ where: { id: rec.id }, data: { usedAt: new Date() } }),
  ]);
  await revokeAllSessions(rec.userId);
}`
        }
      }
    ],
    summary: [
      "TOTP = HMAC(secret, bước 30 giây) rút gọn thành 6 số; secret phải được mã hoá khi lưu.",
      "Chặn dùng lại mã, rate limit, cấp recovery code dạng hash; passkey chống phishing tốt nhất.",
      "Token reset: ngẫu nhiên ≥ 128 bit, một lần, hạn ngắn, lưu hash.",
      "Không lộ email tồn tại; sau khi reset thu hồi mọi phiên và gửi thông báo."
    ],
    pitfalls: [
      "Tạo link reset từ header `Host` của request: kẻ tấn công đổi Host để link trỏ về domain của họ và thu token. Dùng URL cố định trong cấu hình.",
      "Token reset không hết hạn hoặc dùng được nhiều lần; email cũ trong hộp thư bị lộ là mất tài khoản.",
      "Không rate limit ô nhập mã TOTP, 1 triệu tổ hợp có thể bị dò trong thời gian ngắn."
    ],
    quiz: [
      {
        q: "Vì sao secret TOTP được mã hoá chứ không hash như mật khẩu?",
        options: [
          "Vì Argon2id quá chậm cho mỗi lần nhập mã",
          "Vì secret TOTP không cần bảo mật như mật khẩu",
          "Vì server cần secret gốc để tự tính lại mã",
          "Vì hash làm mã 6 số dài thêm vài ký tự"
        ],
        answer: 2,
        explain: "Mật khẩu chỉ cần so sánh nên hash là đủ; TOTP phải tính lại HMAC từ secret gốc nên cần mã hoá có thể giải mã, với khoá đặt ngoài DB."
      },
      {
        q: "Tính chất nào KHÔNG cần cho token reset mật khẩu?",
        options: [
          "Sinh ngẫu nhiên từ CSPRNG",
          "Dùng một lần và có hạn ngắn",
          "Lưu dạng hash trong DB",
          "Chứa email dạng rõ để tra cứu"
        ],
        answer: 3,
        explain: "Token không nên mang thông tin người dùng; server tra bằng hash của token. Ba tính chất còn lại là bắt buộc."
      },
      {
        q: "Khi người dùng nhập email không tồn tại ở form quên mật khẩu, nên phản hồi thế nào?",
        options: [
          "Trả cùng thông báo như khi email tồn tại",
          "Báo rõ \"Email không tồn tại trong hệ thống\"",
          "Trả lỗi 404 Not Found cho email đó",
          "Tự tạo tài khoản mới với email đó"
        ],
        answer: 0,
        explain: "Thông báo giống nhau ngăn kẻ tấn công dò xem email nào đã đăng ký (user enumeration)."
      }
    ]
  },

  "p05.m1.t0": {
    videos: [
      { id: "S4WqjQUsfSY", title: "1. Phân quyền RBAC: Role-Based Access Control là gì? | RBAC Permissions | TrungQuanDev", channel: "TrungQuanDev - Một Lập Trình Viên", lang: "vi", minutes: 21, embed: true }
    ],
    sections: [
      {
        h: "Authentication khác Authorization",
        p: [
          "Authentication (xác thực) trả lời \"bạn là ai?\". Authorization (phân quyền) trả lời \"bạn được làm gì?\". Đăng nhập thành công chỉ là bước đầu; mỗi request vẫn phải kiểm tra người đó có quyền thực hiện hành động trên tài nguyên cụ thể hay không.",
          "RBAC (Role-Based Access Control) là mô hình phổ biến nhất: quyền (permission) được gom vào vai trò (role), và người dùng được gán role. Thay vì cấp 30 quyền cho từng nhân viên mới, bạn gán role `editor` là xong."
        ]
      },
      {
        h: "Thiết kế dữ liệu RBAC",
        p: [
          "Nên kiểm tra theo permission (`article:publish`) thay vì theo tên role (`if role === 'admin'`) trong code. Khi nghiệp vụ muốn tạo role mới `senior-editor` có quyền xuất bản, bạn chỉ cần thêm dữ liệu, không phải sửa và deploy lại code ở hàng chục chỗ."
        ],
        code: {
          lang: "sql",
          file: "rbac.sql",
          src: `CREATE TABLE roles (
  id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code text NOT NULL UNIQUE           -- 'admin', 'editor', 'viewer'
);
CREATE TABLE permissions (
  id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code text NOT NULL UNIQUE           -- 'article:create', 'article:publish'
);
CREATE TABLE role_permissions (
  role_id       bigint REFERENCES roles(id) ON DELETE CASCADE,
  permission_id bigint REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);
CREATE TABLE user_roles (
  user_id bigint REFERENCES users(id) ON DELETE CASCADE,
  role_id bigint REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- Lấy toàn bộ quyền của một user
SELECT DISTINCT p.code
FROM user_roles ur
JOIN role_permissions rp ON rp.role_id = ur.role_id
JOIN permissions p ON p.id = rp.permission_id
WHERE ur.user_id = 42;`
        }
      },
      {
        h: "Kiểm tra quyền bằng Guard trong NestJS",
        p: [
          "Trong NestJS, bạn gắn metadata quyền lên route bằng decorator, và một Guard đọc metadata đó để so với quyền của user (đã được nạp vào `request.user` sau bước xác thực). Kiểm tra tập trung ở một chỗ giúp không route nào bị quên.",
          "Nên đặt mặc định là từ chối: guard toàn cục yêu cầu đăng nhập cho mọi route, chỉ route đánh dấu `@Public()` mới bỏ qua. Quyền có thể cache trong Redis hoặc đưa vào access token, nhưng nhớ rằng khi thu hồi role, token cũ vẫn mang quyền cũ cho đến khi hết hạn."
        ],
        code: {
          lang: "typescript",
          file: "permissions.guard.ts",
          src: `import { CanActivate, ExecutionContext, Injectable, SetMetadata, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...perms: string[]) => SetMetadata(PERMISSIONS_KEY, perms);

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required?.length) return true;
    const user = ctx.switchToHttp().getRequest().user as { permissions: string[] } | undefined;
    const ok = !!user && required.every((p) => user.permissions.includes(p));
    if (!ok) throw new ForbiddenException();
    return true;
  }
}

// Sử dụng
// @Post(':id/publish')
// @RequirePermissions('article:publish')
// publish(@Param('id') id: string) { ... }`
        }
      }
    ],
    summary: [
      "Authentication xác định danh tính; authorization quyết định quyền trên từng request.",
      "RBAC: user → role → permission; lưu bằng các bảng liên kết n-n.",
      "Kiểm tra theo permission thay vì tên role để thay đổi quyền không cần sửa code.",
      "Tập trung kiểm tra ở Guard/middleware với nguyên tắc mặc định từ chối."
    ],
    pitfalls: [
      "Rải `if (user.role === 'admin')` khắp code, thêm role mới phải sửa hàng chục chỗ. Kiểm tra theo permission.",
      "Chỉ ẩn nút trên giao diện mà không kiểm tra ở API: ai cũng gọi API trực tiếp được. Frontend chỉ để hiển thị, backend mới là nơi quyết định.",
      "Nhúng danh sách quyền vào JWT hạn dài, thu hồi quyền không có hiệu lực ngay. Dùng token ngắn hạn hoặc tra quyền từ cache có thể xoá."
    ],
    quiz: [
      {
        q: "Vì sao nên kiểm tra theo permission (`article:publish`) thay vì theo tên role?",
        options: [
          "Vì chuỗi permission ngắn hơn tên role",
          "Vì đổi quyền của role chỉ cần sửa dữ liệu",
          "Vì NestJS Guard không đọc được tên role",
          "Vì role không lưu được trong database"
        ],
        answer: 1,
        explain: "Code chỉ phụ thuộc vào quyền cần có; việc role nào mang quyền đó là cấu hình. Thêm role mới không cần deploy lại."
      },
      {
        q: "Trong NestJS, thành phần nào thường dùng để chặn request không đủ quyền trước khi vào handler?",
        options: ["Pipe", "Interceptor", "Guard", "DTO"],
        answer: 2,
        explain: "Guard chạy trước interceptor và pipe, và có nhiệm vụ chuyên biệt là quyết định request có được đi tiếp hay không. Interceptor bọc quanh handler (log, biến đổi response, cache); Pipe để validate/biến đổi dữ liệu; DTO mô tả dữ liệu đầu vào."
      },
      {
        q: "Nguyên tắc \"mặc định từ chối\" nghĩa là gì?",
        options: [
          "Mọi route đều mở, trừ route bị đánh dấu cấm",
          "Chỉ cho phép phương thức GET khi chưa đăng nhập",
          "Từ chối mọi request đến từ tài khoản admin",
          "Mọi route đều bị chặn, trừ route đánh dấu công khai"
        ],
        answer: 3,
        explain: "Quên đánh dấu một route thì nó vẫn được bảo vệ, an toàn hơn nhiều so với quên chặn một route."
      }
    ]
  },

  "p05.m1.t1": {
    videos: [
      { id: "rvZ35YW4t5k", title: "Role-based access control (RBAC) vs. Attribute-based access control (ABAC)", channel: "IBM Technology", lang: "en", minutes: 8, embed: true }
    ],
    sections: [
      {
        h: "Khi RBAC không đủ",
        p: [
          "RBAC trả lời \"editor có được sửa bài viết không?\". Nhưng nghiệp vụ thật thường hỏi chi tiết hơn: \"editor chỉ được sửa bài của chính mình khi bài còn ở trạng thái nháp\", \"quản lý chỉ duyệt đơn nghỉ phép của nhân viên cùng phòng ban\", \"không ai được tự duyệt đơn của chính mình\".",
          "Nếu cố giải quyết bằng RBAC, bạn sẽ bùng nổ role: `editor-draft-own`, `manager-dept-sales`... ABAC (Attribute-Based Access Control) giải quyết bằng cách quyết định dựa trên thuộc tính của người dùng (phòng ban, cấp bậc), tài nguyên (chủ sở hữu, trạng thái, phòng ban), hành động và ngữ cảnh (thời gian, IP)."
        ]
      },
      {
        h: "ABAC trong code với CASL",
        p: [
          "CASL là thư viện JavaScript cho phép khai báo quy tắc dạng \"có thể làm hành động X trên loại Y với điều kiện Z\". Cùng một định nghĩa quy tắc có thể dùng ở backend lẫn frontend (để ẩn nút), và CASL còn có thể chuyển điều kiện thành bộ lọc truy vấn DB."
        ],
        code: {
          lang: "typescript",
          file: "ability.ts",
          src: `import { AbilityBuilder, createMongoAbility, subject } from '@casl/ability';

type User = { id: number; role: 'admin' | 'editor' | 'manager'; departmentId: number };

export function defineAbilityFor(user: User) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (user.role === 'admin') {
    can('manage', 'all');
  }
  if (user.role === 'editor') {
    can('read', 'Article');
    can('update', 'Article', { authorId: user.id, status: 'draft' });
  }
  if (user.role === 'manager') {
    can('approve', 'LeaveRequest', { departmentId: user.departmentId, status: 'pending' });
    cannot('approve', 'LeaveRequest', { requesterId: user.id }); // không tự duyệt
  }
  return build();
}

// Trong service: nạp tài nguyên TRƯỚC, rồi kiểm tra với thuộc tính thật của nó
const ability = defineAbilityFor(currentUser);
const leave = await db.leaveRequest.findUniqueOrThrow({ where: { id } });
if (ability.cannot('approve', subject('LeaveRequest', leave))) {
  throw new ForbiddenException();
}`
        }
      },
      {
        h: "Policy tách khỏi code với OPA",
        p: [
          "Khi có nhiều service viết bằng nhiều ngôn ngữ, hoặc đội bảo mật muốn quản lý chính sách tập trung, bạn có thể dùng Open Policy Agent (OPA). Service gửi `input` (user, action, resource) tới OPA; OPA đánh giá policy viết bằng ngôn ngữ Rego và trả về cho phép hay không. Policy được version, review và test riêng như code.",
          "Đánh đổi: thêm một thành phần hạ tầng và một lần gọi mạng (thường chạy OPA cạnh service dạng sidecar để giảm độ trễ), và đội phải học Rego. Với một ứng dụng NestJS đơn lẻ, CASL hoặc policy viết trong code là đủ. Các lựa chọn khác trong hệ sinh thái gồm Cedar (của AWS) và hệ thống kiểu Zanzibar như OpenFGA cho phân quyền dựa trên quan hệ."
        ],
        code: {
          lang: "text",
          file: "leave.rego",
          src: `package app.authz

default allow := false

allow if {
  input.action == "approve"
  input.user.role == "manager"
  input.user.department_id == input.resource.department_id
  input.resource.status == "pending"
  input.user.id != input.resource.requester_id
}`
        }
      }
    ],
    summary: [
      "ABAC quyết định dựa trên thuộc tính của user, tài nguyên, hành động và ngữ cảnh.",
      "Dùng ABAC khi RBAC bắt đầu bùng nổ số lượng role.",
      "CASL khai báo quy tắc có điều kiện trong TypeScript; luôn kiểm tra trên tài nguyên thật đã nạp.",
      "OPA/Rego tách policy khỏi code cho hệ thống nhiều service, đổi lại thêm hạ tầng."
    ],
    pitfalls: [
      "Kiểm tra quyền bằng thuộc tính do client gửi lên (ví dụ `authorId` trong body), kẻ tấn công chỉ cần sửa body. Luôn nạp tài nguyên từ DB rồi mới kiểm tra.",
      "Kiểm tra quyền trên danh sách bằng cách lấy hết rồi lọc trong code: chậm và dễ lộ tổng số bản ghi. Chuyển điều kiện quyền thành điều kiện WHERE.",
      "Policy phức tạp không có test, một thay đổi nhỏ mở quyền ngoài ý muốn. Viết test cho các trường hợp cho phép và từ chối."
    ],
    quiz: [
      {
        q: "Quy tắc \"quản lý chỉ duyệt đơn của nhân viên cùng phòng ban\" phù hợp với mô hình nào?",
        options: ["ABAC", "RBAC thuần", "Không cần phân quyền", "Chỉ cần xác thực"],
        answer: 0,
        explain: "Quy tắc dựa trên thuộc tính phòng ban của cả người dùng và tài nguyên, đúng bản chất ABAC. RBAC thuần chỉ biết role, không biết phòng ban."
      },
      {
        q: "Khi dùng CASL, vì sao phải nạp tài nguyên từ DB trước khi gọi ability.can?",
        options: [
          "Vì CASL cần kết nối DB để chạy được",
          "Vì điều kiện phải so trên dữ liệu thật trong DB",
          "Vì nạp trước giúp ability.can chạy nhanh hơn",
          "Vì createMongoAbility chỉ chạy với MongoDB"
        ],
        answer: 1,
        explain: "Quyết định dựa trên thuộc tính chỉ đúng khi thuộc tính đáng tin. createMongoAbility chỉ dùng cú pháp điều kiện kiểu MongoDB, không đòi hỏi dùng MongoDB."
      },
      {
        q: "Lợi ích chính của OPA là gì?",
        options: [
          "Thay thế hoàn toàn bước xác thực người dùng",
          "Tự động mã hoá dữ liệu trước khi lưu",
          "Tách policy khỏi code, dùng chung nhiều service",
          "Lưu trữ dữ liệu người dùng thay cho database"
        ],
        answer: 2,
        explain: "OPA là policy engine đa dụng: service hỏi, OPA trả lời theo policy Rego. Nó không làm xác thực hay mã hoá."
      }
    ]
  },

  "p05.m1.t2": {
    videos: [
      { id: "2KqZJDf7uQI", title: "TÔI MẤT (bị hack) TÀI KHOẢN NHƯ THẾ NÀY? IDOR là gì?", channel: "Tips Javascript", lang: "vi", minutes: 16, embed: true }
    ],
    sections: [
      {
        h: "IDOR: lỗi phổ biến nhất nhưng đơn giản nhất",
        p: [
          "IDOR (Insecure Direct Object Reference) xảy ra khi API nhận một định danh từ client và trả về tài nguyên mà không kiểm tra người gọi có quyền với tài nguyên đó. Người dùng A gọi `GET /api/invoices/1001` thấy hoá đơn của mình, đổi thành `1002` và thấy hoá đơn của người khác.",
          "Broken Access Control tiếp tục đứng vị trí A01 trong OWASP Top 10:2025. Lý do là lỗi này không thể phát hiện bằng công cụ tự động một cách đáng tin: mỗi endpoint có luật sở hữu khác nhau, và chỉ cần quên một chỗ là đủ lộ dữ liệu.",
          "Dùng UUID thay cho id tăng dần làm việc đoán khó hơn, nhưng KHÔNG phải là biện pháp kiểm soát truy cập. ID vẫn lộ qua URL, log, email chia sẻ. Luôn kiểm tra quyền."
        ]
      },
      {
        h: "Sửa đúng: gắn quyền vào truy vấn",
        p: [
          "Cách chắc chắn nhất là đưa điều kiện sở hữu vào chính câu truy vấn, để DB không bao giờ trả về dữ liệu của người khác. Trả `404 Not Found` thay vì `403` cho tài nguyên không thuộc về người dùng giúp không tiết lộ rằng tài nguyên đó tồn tại."
        ],
        code: {
          lang: "typescript",
          file: "invoices.service.ts",
          src: `// SAI: tin ID từ client
async getInvoiceBad(id: string) {
  return this.db.invoice.findUnique({ where: { id } });
}

// ĐÚNG: điều kiện sở hữu nằm trong truy vấn
async getInvoice(currentUserId: string, id: string) {
  const invoice = await this.db.invoice.findFirst({
    where: { id, customerId: currentUserId },
  });
  if (!invoice) throw new NotFoundException();
  return invoice;
}

// SAI: cho client tự khai báo chủ sở hữu
// POST /api/invoices  body: { customerId: "người-khác", ... }
// ĐÚNG: lấy từ phiên đăng nhập, bỏ qua trường đó trong body
async createInvoice(currentUserId: string, dto: CreateInvoiceDto) {
  return this.db.invoice.create({ data: { ...dto, customerId: currentUserId } });
}`
        }
      },
      {
        h: "Các dạng Broken Access Control khác",
        list: [
          "Leo quyền theo chiều dọc: user thường gọi được API admin vì route admin chỉ bị ẩn trên giao diện.",
          "Mass assignment: client gửi thêm trường `role: \"admin\"` hoặc `isVerified: true` và API lưu thẳng vào DB. Dùng DTO với whitelist (`ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` trong NestJS).",
          "Thiếu kiểm tra ở hành động gián tiếp: export CSV, tải file đính kèm, webhook, GraphQL resolver lồng nhau.",
          "Tin vào dữ liệu phía client: giá, giảm giá, trạng thái đơn gửi từ frontend."
        ],
        p: [
          "Cách phòng thủ có hệ thống: viết test tự động \"user A không đọc/sửa/xoá được tài nguyên của user B\" cho mọi endpoint, ghi log và cảnh báo khi có nhiều lỗi 403/404 liên tiếp từ một người dùng."
        ]
      }
    ],
    summary: [
      "IDOR: API trả tài nguyên theo ID từ client mà không kiểm tra quyền sở hữu.",
      "Broken Access Control là A01 trong OWASP Top 10:2025.",
      "Đưa điều kiện sở hữu vào truy vấn; lấy chủ sở hữu từ phiên, không từ body.",
      "UUID không thay thế kiểm tra quyền; chống mass assignment bằng DTO whitelist.",
      "Viết test chéo người dùng cho mọi endpoint."
    ],
    pitfalls: [
      "Kiểm tra quyền ở `GET` nhưng quên ở `PATCH`, `DELETE` hoặc endpoint tải file. Kiểm tra cho mọi hành động.",
      "Tin tưởng id là UUID nên \"không ai đoán được\"; ID lộ qua link chia sẻ là đủ để khai thác.",
      "Lưu thẳng `req.body` vào DB bằng ORM, người dùng tự nâng role. Chỉ nhận trường được khai báo trong DTO."
    ],
    quiz: [
      {
        q: "Cách sửa IDOR đáng tin cậy nhất là gì?",
        options: [
          "Đổi id tăng dần sang UUID ngẫu nhiên",
          "Ẩn id khỏi URL và giao diện",
          "Mã hoá id bằng base64 trước khi trả về",
          "Đưa điều kiện sở hữu vào truy vấn ở server"
        ],
        answer: 3,
        explain: "Chỉ kiểm tra phía server mới ngăn truy cập trái phép. UUID, ẩn id hay base64 chỉ làm việc đoán khó hơn, không kiểm soát truy cập."
      },
      {
        q: "Trong OWASP Top 10:2025, Broken Access Control ở vị trí nào?",
        options: ["A01", "A03", "A05", "A10"],
        answer: 0,
        explain: "Broken Access Control giữ vị trí A01. A03 là Software Supply Chain Failures, A05 là Injection, A10 là Mishandling of Exceptional Conditions."
      },
      {
        q: "Mass assignment là gì?",
        options: [
          "Client gửi quá nhiều request trong một giây",
          "API lưu cả trường client tự thêm, như role",
          "Admin gán nhiều role cho cùng một user",
          "API tạo hàng loạt bản ghi trong một request"
        ],
        answer: 1,
        explain: "Lỗi xảy ra khi API map toàn bộ body vào model. Dùng DTO whitelist để chỉ nhận trường cho phép."
      }
    ]
  },

  "p05.m1.t3": {
    videos: [
      { id: "d57oH6mcKa0", title: "Multi Tenant Architecture: Từ lý thuyết tới thực tế", channel: "Code With Me", lang: "vi", minutes: 14, embed: true },
      { id: "vZT1Qx2xUCo", title: "Everything you need to know about Postgres Row Level Security | POSETTE 2024", channel: "Microsoft Developer", lang: "en", minutes: 18, embed: true }
    ],
    sections: [
      {
        h: "Ba mô hình cô lập tenant",
        p: [
          "Ứng dụng SaaS phục vụ nhiều khách hàng doanh nghiệp (tenant) trên cùng hệ thống. Yêu cầu sống còn: dữ liệu công ty A không bao giờ lộ sang công ty B. Có ba mô hình chính, đánh đổi giữa mức cô lập và chi phí vận hành."
        ],
        list: [
          "Chung bảng, cột `tenant_id`: mọi bảng nghiệp vụ có `tenant_id`, mọi truy vấn phải lọc theo nó. Rẻ nhất, dễ migrate, dễ scale số tenant lên hàng nghìn. Rủi ro: quên một điều kiện WHERE là lộ dữ liệu.",
          "Schema riêng cho mỗi tenant: cùng database, mỗi tenant một schema Postgres. Cô lập tốt hơn, dễ backup/xoá một tenant. Nhưng migration phải chạy trên hàng trăm schema, và số lượng bảng lớn làm tăng gánh nặng cho catalog.",
          "Database riêng cho mỗi tenant: cô lập mạnh nhất, đáp ứng yêu cầu khách hàng lớn về dữ liệu tách biệt, tránh \"hàng xóm ồn ào\" chiếm tài nguyên. Đắt nhất và phức tạp nhất để vận hành."
        ],
        code: {
          lang: "sql",
          file: "tenant_schema.sql",
          src: `CREATE TABLE projects (
  id        uuid PRIMARY KEY DEFAULT uuidv7(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  name      text NOT NULL,
  UNIQUE (tenant_id, name)   -- tên dự án chỉ cần duy nhất trong một tenant
);
-- tenant_id đứng đầu index vì mọi truy vấn đều lọc theo nó
CREATE INDEX projects_tenant_idx ON projects (tenant_id, id);`
        }
      },
      {
        h: "Row Level Security: để Postgres lọc hộ",
        p: [
          "Với mô hình chung bảng, Row Level Security (RLS) biến việc lọc tenant thành ràng buộc của database. Bạn khai báo policy, và Postgres tự thêm điều kiện vào mọi truy vấn của role ứng dụng. Kể cả khi code quên `WHERE tenant_id = ...`, người dùng cũng không thấy dữ liệu tenant khác.",
          "Ứng dụng đặt tenant hiện tại vào biến cấu hình trong phạm vi transaction bằng `set_config(..., true)`. Tham số `true` nghĩa là giá trị chỉ tồn tại trong transaction hiện tại, an toàn khi dùng connection pool hoặc PgBouncer transaction mode.",
          "Lưu ý: superuser và role có thuộc tính `BYPASSRLS` luôn bỏ qua RLS; chủ sở hữu bảng cũng bỏ qua trừ khi bật `FORCE ROW LEVEL SECURITY`. Ứng dụng nên kết nối bằng một role thường, không phải owner."
        ],
        code: {
          lang: "sql",
          file: "rls.sql",
          src: `ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects FORCE ROW LEVEL SECURITY;

-- nullif: sau khi transaction trước kết thúc, biến có thể còn là chuỗi rỗng '' (không phải NULL);
-- ''::uuid sẽ báo lỗi, còn NULL làm điều kiện sai => không thấy dòng nào (fail closed)
CREATE POLICY tenant_isolation ON projects
  USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

-- Role ứng dụng: không phải owner, không BYPASSRLS
CREATE ROLE app_user LOGIN PASSWORD 'đổi-bằng-secret-thật';
GRANT SELECT, INSERT, UPDATE, DELETE ON projects TO app_user;

-- Mỗi request, trong một transaction:
BEGIN;
SELECT set_config('app.tenant_id', '0192f1c2-7b1a-7c3e-9a55-3f2d1e0c9b8a', true);
SELECT * FROM projects;          -- chỉ thấy project của tenant này
COMMIT;`
        }
      },
      {
        h: "Tenant đến từ đâu?",
        p: [
          "Tenant hiện tại phải lấy từ nguồn đáng tin: phiên đăng nhập hoặc claim trong token đã xác thực, sau khi kiểm tra user thực sự là thành viên của tenant đó. Không lấy từ header `X-Tenant-Id` hay query string mà không kiểm tra, vì đó chính là IDOR ở mức tenant.",
          "Ngoài database, hãy nghĩ tới các nơi khác dữ liệu có thể rò rỉ: key cache Redis phải có tiền tố tenant, file trên object storage nên nằm dưới prefix theo tenant, job nền phải mang theo tenant_id, và log/metric nên gắn nhãn tenant để điều tra sự cố."
        ]
      }
    ],
    summary: [
      "Ba mô hình: cột tenant_id (rẻ, phổ biến), schema riêng, database riêng (cô lập mạnh nhất, đắt nhất).",
      "RLS cho Postgres tự lọc theo tenant, là lưới an toàn khi code quên WHERE.",
      "Dùng `set_config('app.tenant_id', ..., true)` trong transaction; app kết nối bằng role không phải owner.",
      "Tenant lấy từ phiên đã xác thực và kiểm tra thành viên; cô lập cả cache, file, job."
    ],
    pitfalls: [
      "Ứng dụng kết nối bằng owner của bảng mà không bật FORCE, RLS không có tác dụng. Dùng role riêng và FORCE ROW LEVEL SECURITY.",
      "Dùng `SET app.tenant_id` mức session qua connection pool, request sau dùng nhầm tenant của request trước. Dùng `set_config(..., true)` trong transaction.",
      "Key cache như `cache:dashboard` không có tenant, tenant B thấy dashboard của tenant A."
    ],
    quiz: [
      {
        q: "Mô hình nào cô lập dữ liệu mạnh nhất giữa các tenant?",
        options: ["Chung bảng với tenant_id", "Schema riêng", "Database riêng cho mỗi tenant", "Không có khác biệt"],
        answer: 2,
        explain: "Database riêng tách cả dữ liệu lẫn tài nguyên, đổi lại chi phí vận hành cao nhất. Hai mô hình còn lại dùng chung database."
      },
      {
        q: "Vì sao nên dùng `set_config('app.tenant_id', x, true)` thay vì SET mức session?",
        options: [
          "Vì set_config chạy nhanh hơn lệnh SET",
          "Vì policy RLS chỉ đọc được biến tạo bằng set_config",
          "Vì lệnh SET không nhận giá trị kiểu uuid",
          "Vì giá trị hết hiệu lực khi transaction kết thúc"
        ],
        answer: 3,
        explain: "Tham số true làm giá trị có hiệu lực cục bộ trong transaction (tương đương SET LOCAL). Với pool, kết nối được tái sử dụng nên giá trị mức session có thể rò sang request khác. current_setting đọc được cả biến đặt bằng SET lẫn set_config."
      },
      {
        q: "Trường hợp nào RLS KHÔNG được áp dụng?",
        options: [
          "Kết nối bằng superuser hoặc role BYPASSRLS",
          "Kết nối bằng role thường, không phải owner",
          "Truy vấn có ORDER BY và LIMIT",
          "Bảng có index trên cột tenant_id"
        ],
        answer: 0,
        explain: "Superuser và role BYPASSRLS luôn bỏ qua RLS; owner cũng bỏ qua nếu không FORCE. Vì vậy ứng dụng phải dùng role thường."
      }
    ]
  },

  "p05.m2.t0": {
    videos: [
      { id: "Jzr0Jdnq_EI", title: "OWASP Top 10 2025: Your complete guide to securing your applications", channel: "Aikido Security", lang: "en", minutes: 25, embed: true }
    ],
    sections: [
      {
        h: "OWASP Top 10 là gì và dùng để làm gì?",
        p: [
          "OWASP Top 10 là danh sách mười nhóm rủi ro bảo mật ứng dụng web phổ biến và nghiêm trọng nhất, được tổng hợp từ dữ liệu kiểm thử của nhiều tổ chức và khảo sát cộng đồng. Nó không phải một tiêu chuẩn đầy đủ, mà là bản đồ nhận thức tối thiểu mà mọi backend engineer nên nắm.",
          "Phiên bản 2025 có hai hạng mục mới là A03 Software Supply Chain Failures (mở rộng từ \"thành phần có lỗ hổng/lỗi thời\") và A10 Mishandling of Exceptional Conditions. SSRF, vốn là một mục riêng ở bản 2021, được gộp vào A01 Broken Access Control."
        ]
      },
      {
        h: "Mười hạng mục của 2025",
        list: [
          "A01 Broken Access Control: truy cập tài nguyên hoặc chức năng không được phép (IDOR, leo quyền, SSRF). Vẫn đứng đầu.",
          "A02 Security Misconfiguration: cấu hình mặc định, bật debug trên production, bucket công khai, thiếu security header.",
          "A03 Software Supply Chain Failures: dependency độc hại hoặc có lỗ hổng, pipeline build bị xâm nhập, không kiểm soát nguồn gốc gói.",
          "A04 Cryptographic Failures: không mã hoá dữ liệu nhạy cảm, thuật toán yếu, quản lý khoá kém, lưu mật khẩu sai cách.",
          "A05 Injection: SQL, NoSQL, OS command, và cả XSS (chèn script vào trang).",
          "A06 Insecure Design: lỗi ở mức thiết kế, như luồng reset mật khẩu thiếu hạn chế, không có giới hạn nghiệp vụ.",
          "A07 Authentication Failures: brute-force, credential stuffing, quản lý phiên yếu, thiếu MFA.",
          "A08 Software or Data Integrity Failures: tin dữ liệu hoặc bản cập nhật không được xác minh tính toàn vẹn, deserialization không an toàn.",
          "A09 Security Logging & Alerting Failures: không ghi log sự kiện quan trọng hoặc có log nhưng không ai được cảnh báo.",
          "A10 Mishandling of Exceptional Conditions: xử lý lỗi và tình huống bất thường sai, như \"fail open\" (lỗi thì cho qua), lộ stack trace, trạng thái dở dang khi exception."
        ],
        p: [
          "Các lỗ hổng thực tế thường nằm ở giao điểm của nhiều mục, nên hãy coi danh sách là các góc nhìn bổ trợ nhau."
        ]
      },
      {
        h: "Ví dụ A10: fail closed, không fail open",
        p: [
          "Hạng mục mới A10 rất gần với code backend hằng ngày. Khi dịch vụ phân quyền hoặc kiểm tra thanh toán bị lỗi, code phải từ chối (fail closed) thay vì cho qua. Exception cũng phải được bắt ở một chỗ tập trung, ghi log đầy đủ ở server, và chỉ trả thông báo chung cho client."
        ],
        code: {
          lang: "typescript",
          file: "fail-closed.ts",
          src: `// SAI: lỗi khi gọi dịch vụ quyền thì mặc định cho phép
async function canAccessBad(userId: string, docId: string) {
  try {
    return await authzClient.check(userId, 'read', docId);
  } catch {
    return true; // fail open: sự cố hạ tầng biến thành lỗ hổng
  }
}

// ĐÚNG: lỗi thì từ chối và ghi log để điều tra
async function canAccess(userId: string, docId: string) {
  try {
    return await authzClient.check(userId, 'read', docId);
  } catch (err) {
    logger.error({ err, userId, docId }, 'authz check failed');
    return false; // fail closed
  }
}`
        }
      }
    ],
    summary: [
      "OWASP Top 10 là bản đồ rủi ro tối thiểu, không phải checklist đầy đủ.",
      "2025: A01 Broken Access Control vẫn đứng đầu; SSRF được gộp vào A01.",
      "Mới trong 2025: A03 Software Supply Chain Failures và A10 Mishandling of Exceptional Conditions.",
      "Nguyên tắc từ A10: fail closed, xử lý exception tập trung, không lộ chi tiết lỗi cho client."
    ],
    pitfalls: [
      "Coi Top 10 là đủ và bỏ qua threat modeling cho nghiệp vụ riêng. Dùng thêm OWASP ASVS để có yêu cầu chi tiết.",
      "Bắt exception rồi trả về giá trị \"mặc định thuận tiện\" (true, danh sách rỗng) ở đoạn code liên quan quyền. Mặc định phải là từ chối.",
      "Trả stack trace hoặc câu SQL lỗi trong response production. Log chi tiết ở server, trả thông báo chung kèm request id."
    ],
    quiz: [
      {
        q: "Hạng mục nào đứng đầu OWASP Top 10:2025?",
        options: ["Injection", "Broken Access Control", "Cryptographic Failures", "Security Misconfiguration"],
        answer: 1,
        explain: "A01 là Broken Access Control. Security Misconfiguration là A02, Cryptographic Failures là A04, Injection là A05."
      },
      {
        q: "Hạng mục nào là MỚI trong OWASP Top 10:2025?",
        options: [
          "Injection",
          "Broken Access Control",
          "Mishandling of Exceptional Conditions",
          "Security Misconfiguration"
        ],
        answer: 2,
        explain: "A10 Mishandling of Exceptional Conditions và A03 Software Supply Chain Failures là hai hạng mục mới. Ba mục còn lại đã có từ các phiên bản trước."
      },
      {
        q: "Khi dịch vụ kiểm tra quyền bị timeout, hành vi an toàn là gì?",
        options: [
          "Cho phép truy cập để không làm phiền người dùng",
          "Trả stack trace cho client",
          "Thử lại vô hạn",
          "Từ chối truy cập và ghi log lỗi"
        ],
        answer: 3,
        explain: "Fail closed: khi không xác định được quyền thì từ chối. Cho phép là fail open; thử lại vô hạn gây nghẽn; stack trace lộ thông tin nội bộ."
      }
    ]
  },

  "p05.m2.t1": {
    videos: [
      { id: "TwisdmReRzA", title: "Infra Coffee Time #20: SQL Injection là gì? Tìm hiểu về mối đe dọa tiềm ẩn của mọi website", channel: "Viettel IDC", lang: "vi", minutes: 5, embed: true }
    ],
    sections: [
      {
        h: "SQL Injection xảy ra thế nào?",
        p: [
          "Injection xảy ra khi dữ liệu từ người dùng bị ghép thẳng vào câu lệnh mà một trình thông dịch (SQL engine, shell, MongoDB) sẽ thực thi. Dữ liệu \"nhảy\" từ vai trò giá trị sang vai trò code.",
          "Ví dụ: `\"SELECT * FROM users WHERE email = '\" + email + \"'\"`. Nếu kẻ tấn công gửi `' OR '1'='1`, điều kiện luôn đúng và trả về mọi user. Với payload phức tạp hơn, họ có thể đọc bảng khác qua UNION, hoặc dò dữ liệu từng bit qua thời gian phản hồi (blind SQLi)."
        ]
      },
      {
        h: "Parameterized query: câu lệnh và dữ liệu đi riêng",
        p: [
          "Với parameterized query, câu SQL chứa placeholder (`$1`, `$2`) và giá trị được gửi riêng qua giao thức của Postgres. DB phân tích cú pháp câu lệnh trước, dữ liệu không bao giờ được hiểu là SQL, dù chứa dấu nháy hay từ khoá gì.",
          "Tên bảng, tên cột, hướng sắp xếp không thể tham số hoá. Khi cho người dùng chọn cột sắp xếp, hãy map qua danh sách cho phép (whitelist) thay vì ghép chuỗi."
        ],
        code: {
          lang: "typescript",
          file: "safe-queries.ts",
          src: `import { Pool } from 'pg';
const pool = new Pool();

// SAI: ghép chuỗi
// await pool.query(\`SELECT * FROM users WHERE email = '\${email}'\`);

// ĐÚNG: tham số hoá
const { rows } = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);

// Cột sắp xếp: whitelist, không ghép input thô
const SORTABLE = { created: 'created_at', name: 'full_name' } as const;
function listUsers(sortKey: string, dir: string) {
  const column = SORTABLE[sortKey as keyof typeof SORTABLE] ?? 'created_at';
  const direction = dir === 'asc' ? 'ASC' : 'DESC';
  return pool.query(\`SELECT id, full_name FROM users ORDER BY \${column} \${direction} LIMIT $1\`, [50]);
}

// Prisma: tagged template an toàn; $queryRawUnsafe với input ghép chuỗi là nguy hiểm
await prisma.$queryRaw\`SELECT id FROM users WHERE email = \${email}\`;`
        }
      },
      {
        h: "NoSQL injection và các loại injection khác",
        p: [
          "MongoDB không dùng chuỗi SQL, nhưng vẫn bị injection qua toán tử. Nếu API đưa thẳng body JSON vào filter, kẻ tấn công gửi `{\"email\": \"admin@x.vn\", \"password\": {\"$ne\": null}}` và điều kiện mật khẩu luôn đúng. Cách phòng: validate kiểu dữ liệu đầu vào (email phải là string) bằng Zod/class-validator, và bật `sanitizeFilter` của Mongoose để loại bỏ các khoá bắt đầu bằng `$` trong filter.",
          "Các dạng khác cần nhớ: OS command injection (dùng `execFile`/`spawn` với mảng tham số thay vì `exec` với chuỗi), LDAP injection, và template injection khi render template từ chuỗi người dùng. Nguyên tắc chung giống nhau: tách dữ liệu khỏi lệnh, validate theo whitelist, và chạy với quyền tối thiểu (role DB của ứng dụng không cần quyền DROP TABLE)."
        ],
        code: {
          lang: "typescript",
          file: "nosql.ts",
          src: `import { z } from 'zod';

const LoginDto = z.object({
  email: z.email(), // Zod 4; bản 3 viết z.string().email()
  password: z.string().min(1).max(200),
});

export async function login(body: unknown) {
  const { email, password } = LoginDto.parse(body); // { "$ne": null } bị từ chối vì không phải string
  const user = await User.findOne({ email });
  if (!user || !(await argon2.verify(user.passwordHash, password))) {
    throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
  }
  return user;
}`
        }
      }
    ],
    summary: [
      "Injection là khi dữ liệu người dùng được thực thi như code do ghép chuỗi.",
      "Luôn dùng parameterized query; ORM/query builder tham số hoá mặc định.",
      "Tên cột, hướng sắp xếp không tham số hoá được: dùng whitelist.",
      "NoSQL injection qua toán tử `$ne`, `$gt`: validate kiểu đầu vào và sanitize filter.",
      "Chạy với quyền DB tối thiểu để giới hạn thiệt hại."
    ],
    pitfalls: [
      "Dùng `$queryRawUnsafe` hoặc `sql.raw` với chuỗi có input người dùng \"vì tiện\". Chỉ dùng API tham số hoá.",
      "Tự escape dấu nháy bằng `replace` thay vì tham số hoá, luôn có trường hợp bị sót.",
      "Ứng dụng kết nối DB bằng superuser, một lỗi injection thành chiếm toàn bộ database. Dùng role với quyền tối thiểu."
    ],
    quiz: [
      {
        q: "Vì sao parameterized query chống được SQL injection?",
        options: [
          "Vì giá trị gửi tách khỏi câu lệnh, không bị hiểu là SQL",
          "Vì driver mã hoá giá trị trước khi gửi tới DB",
          "Vì driver tự xoá dấu nháy và từ khoá SQL",
          "Vì tham số chỉ được phép là số hoặc UUID"
        ],
        answer: 0,
        explain: "Tách cấu trúc câu lệnh khỏi dữ liệu là bản chất của phòng chống injection. Không có mã hoá hay xoá ký tự nào ở đây."
      },
      {
        q: "Người dùng chọn cột sắp xếp qua query `?sort=`. Cách an toàn là gì?",
        options: [
          "Đưa sort vào tham số $1",
          "Map giá trị sort qua whitelist cột cho phép",
          "Ghép thẳng vào ORDER BY",
          "Escape bằng dấu ngoặc kép"
        ],
        answer: 1,
        explain: "Tên cột không phải giá trị nên không tham số hoá được ($1 sẽ bị hiểu là hằng số). Whitelist đảm bảo chỉ cột hợp lệ lọt vào câu lệnh."
      },
      {
        q: "Payload `{\"password\": {\"$ne\": null}}` gửi tới API đăng nhập MongoDB là dạng tấn công gì?",
        options: ["XSS", "CSRF", "NoSQL injection qua toán tử truy vấn", "SSRF"],
        answer: 2,
        explain: "Kẻ tấn công chèn toán tử $ne để điều kiện luôn đúng. Validate kiểu dữ liệu và sanitize filter sẽ chặn được."
      }
    ]
  },

  "p05.m2.t2": {
    videos: [
      { id: "z4LhLJnmoZ0", title: "Cross-Site Scripting: A 25-Year Threat That Is Still Going Strong", channel: "IBM Technology", lang: "en", minutes: 10, embed: true },
      { id: "txHc4zk6w3s", title: "Content Security Policy explained | how to protect against Cross Site Scripting (XSS)", channel: "Jan Goebel", lang: "en", minutes: 9, embed: true }
    ],
    sections: [
      {
        h: "XSS: khi dữ liệu biến thành script",
        p: [
          "Cross-Site Scripting xảy ra khi dữ liệu không đáng tin được đưa vào trang web theo cách trình duyệt hiểu là code. Script đó chạy với quyền của trang bạn: đọc dữ liệu trên trang, gọi API thay người dùng, thay đổi giao diện để lừa nhập mật khẩu.",
          "Ba dạng: Stored XSS (payload lưu trong DB, như bình luận chứa `<script>`, ảnh hưởng mọi người xem), Reflected XSS (payload nằm trong URL và được phản chiếu vào trang), DOM-based XSS (JavaScript phía client tự đưa dữ liệu từ URL vào `innerHTML`)."
        ]
      },
      {
        h: "Escape output và sanitize HTML",
        p: [
          "Nguyên tắc cốt lõi: escape theo ngữ cảnh ở nơi xuất ra. Chèn vào nội dung HTML thì escape `<`, `>`, `&`, `\"`, `'`; chèn vào thuộc tính, URL hay JavaScript mỗi nơi có quy tắc riêng. React, Vue, Angular và các template engine hiện đại tự escape khi bạn dùng cú pháp nội suy thông thường.",
          "Nguy hiểm xuất hiện khi bạn cố tình chèn HTML thô: `dangerouslySetInnerHTML`, `v-html`, `innerHTML`. Khi thật sự cần hiển thị HTML do người dùng soạn (trình soạn thảo bài viết), phải sanitize bằng thư viện như DOMPurify với danh sách thẻ cho phép. Cũng cần kiểm tra URL: `href=\"javascript:...\"` là một payload phổ biến."
        ],
        code: {
          lang: "tsx",
          file: "Comment.tsx",
          src: `import DOMPurify from 'dompurify';

// An toàn: React tự escape nội dung văn bản
export function CommentText({ body }: { body: string }) {
  return <p>{body}</p>;
}

// Cần hiển thị HTML đã định dạng: sanitize trước
export function RichComment({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'code'],
    ALLOWED_ATTR: ['href'],
  });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}

// Chỉ cho phép link http(s)
export function safeHref(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : '#';
  } catch {
    return '#';
  }
}`
        }
      },
      {
        h: "Content-Security-Policy: lớp phòng thủ thứ hai",
        p: [
          "CSP là header cho trình duyệt biết được phép tải và chạy script, style, ảnh từ đâu. Ngay cả khi kẻ tấn công chèn được `<script>`, trình duyệt sẽ chặn nếu nó không khớp chính sách. CSP không thay thế escape, nó giảm thiệt hại khi bạn lỡ bỏ sót.",
          "Một CSP mạnh dùng nonce: server sinh giá trị ngẫu nhiên mới cho mỗi response, gắn vào header và vào các thẻ `<script nonce=\"...\">` hợp lệ. Tránh `'unsafe-inline'` và `'unsafe-eval'` cho script. Khi mới triển khai, dùng `Content-Security-Policy-Report-Only` để quan sát vi phạm trước khi chặn thật."
        ],
        code: {
          lang: "text",
          file: "csp-header.txt",
          src: `Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-4f8c2a9e1b' 'strict-dynamic';
  style-src 'self';
  img-src 'self' data: https://cdn.devpath.vn;
  connect-src 'self' https://api.devpath.vn;
  object-src 'none';
  base-uri 'none';
  frame-ancestors 'none'
(Gửi trên một dòng; nonce phải sinh ngẫu nhiên mới cho mỗi response)`
        }
      }
    ],
    summary: [
      "XSS có ba dạng: stored, reflected, DOM-based; script chạy với quyền của trang bạn.",
      "Escape theo ngữ cảnh khi xuất; framework hiện đại tự escape khi dùng nội suy thường.",
      "HTML người dùng soạn phải sanitize (DOMPurify) với whitelist thẻ; kiểm tra scheme của URL.",
      "CSP với nonce, không unsafe-inline là lớp phòng thủ thứ hai; bắt đầu bằng Report-Only."
    ],
    pitfalls: [
      "Sanitize khi lưu rồi render bằng `innerHTML` ở nhiều nơi với ngữ cảnh khác nhau. Escape/sanitize ở thời điểm xuất theo đúng ngữ cảnh.",
      "Tin rằng dùng React là miễn nhiễm XSS, rồi dùng `dangerouslySetInnerHTML` hoặc `href={userUrl}` không kiểm tra.",
      "CSP có `'unsafe-inline'` cho script, gần như vô hiệu hoá lợi ích chống XSS. Dùng nonce hoặc hash."
    ],
    quiz: [
      {
        q: "Bình luận chứa `<script>` được lưu vào DB và chạy khi người khác xem. Đây là dạng XSS nào?",
        options: ["Reflected XSS", "CSRF", "DOM-based XSS", "Stored XSS"],
        answer: 3,
        explain: "Payload được lưu trữ và phục vụ lại cho nhiều người dùng là stored XSS, dạng nguy hiểm nhất vì không cần lừa từng người bấm link."
      },
      {
        q: "Vai trò của Content-Security-Policy là gì?",
        options: [
          "Giới hạn nguồn script được chạy, giảm thiệt hại XSS",
          "Thay thế hoàn toàn việc escape output ở server",
          "Mã hoá cookie phiên trước khi gửi cho trình duyệt",
          "Chặn SQL injection trong tham số query string"
        ],
        answer: 0,
        explain: "CSP là lớp phòng thủ bổ sung ở trình duyệt. Escape output vẫn là biện pháp chính; CSP không liên quan SQL hay cookie."
      },
      {
        q: "Khi cần hiển thị HTML do người dùng soạn, cách đúng là gì?",
        options: [
          "Đưa thẳng vào innerHTML vì đã escape khi lưu",
          "Sanitize bằng DOMPurify với whitelist thẻ",
          "Xoá thẻ <script> bằng một regex tự viết",
          "Base64 nội dung rồi giải mã ở trình duyệt"
        ],
        answer: 1,
        explain: "Thư viện sanitize phân tích HTML thật sự và loại bỏ phần nguy hiểm. Regex tự viết rất dễ bị vượt qua (onerror, javascript:, thẻ lồng); base64 rồi giải mã chỉ đưa lại đúng payload cũ; escape khi lưu không bảo vệ khi render bằng innerHTML ở ngữ cảnh khác."
      }
    ]
  },

  "p05.m2.t3": {
    videos: [
      { id: "80S8h5hEwTY", title: "Your App Is NOT Secure If You Don’t Use CSRF Tokens", channel: "Web Dev Simplified", lang: "en", minutes: 10, embed: true }
    ],
    sections: [
      {
        h: "CSRF: mượn cookie của nạn nhân",
        p: [
          "Trình duyệt tự động gửi cookie kèm request tới domain của bạn, bất kể request được khởi tạo từ trang nào (tùy thuộc SameSite). CSRF (Cross-Site Request Forgery) lợi dụng điều đó: người dùng đang đăng nhập ngân hàng, mở trang độc hại có form tự submit `POST https://bank.vn/transfer`. Trình duyệt đính kèm cookie phiên, và server tưởng đó là yêu cầu hợp lệ.",
          "Kẻ tấn công không đọc được response (nhờ Same-Origin Policy), nhưng họ không cần đọc; họ chỉ cần hành động được thực hiện. CSRF chỉ áp dụng khi xác thực dựa vào thông tin trình duyệt tự gửi (cookie, HTTP Basic). API dùng header `Authorization: Bearer` do JavaScript tự gắn không bị CSRF theo cách này."
        ]
      },
      {
        h: "Các lớp phòng thủ",
        list: [
          "SameSite cookie: `Lax` (mặc định trong Chrome) chặn cookie trong POST cross-site; `Strict` chặn cả điều hướng. Đây là lớp nền, nhưng không nên là lớp duy nhất: \"cùng site\" vẫn gồm các subdomain khác, và GET có tác dụng phụ vẫn bị khai thác được với Lax.",
          "CSRF token: server sinh token ngẫu nhiên gắn với phiên; mọi request thay đổi trạng thái phải gửi token trong header hoặc field ẩn. Trang của kẻ tấn công không đọc được token nên không giả mạo được.",
          "Kiểm tra `Origin` (hoặc `Sec-Fetch-Site`) cho request thay đổi trạng thái: từ chối nếu không thuộc danh sách origin của bạn.",
          "Không bao giờ để GET thay đổi dữ liệu. GET phải an toàn và idempotent."
        ],
        p: [
          "Kết hợp SameSite=Lax, kiểm tra Origin và CSRF token cho các hành động nhạy cảm là cấu hình phổ biến cho ứng dụng dùng cookie."
        ]
      },
      {
        h: "Ví dụ: kiểm tra Origin và double-submit token",
        p: [
          "Mẫu double-submit: server đặt một cookie chứa token (không HttpOnly để JS đọc được), frontend đọc và gửi lại trong header `X-CSRF-Token`. Server so khớp hai giá trị. Nên ký token bằng HMAC gắn với session id để kẻ kiểm soát một subdomain không tự ghi được cookie hợp lệ."
        ],
        code: {
          lang: "typescript",
          file: "csrf.middleware.ts",
          src: `import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

const ALLOWED_ORIGINS = new Set(['https://app.devpath.vn']);
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const SECRET = process.env.CSRF_SECRET!;

export function issueCsrfToken(sessionId: string) {
  const nonce = randomBytes(16).toString('base64url');
  const sig = createHmac('sha256', SECRET).update(\`\${sessionId}.\${nonce}\`).digest('base64url');
  return \`\${nonce}.\${sig}\`;
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get('origin');
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return res.status(403).json({ error: 'Bad origin' });

  const header = req.get('x-csrf-token') ?? '';
  const [nonce, sig] = header.split('.');
  const sessionId = (req as any).sessionId as string;
  const expected = createHmac('sha256', SECRET).update(\`\${sessionId}.\${nonce}\`).digest('base64url');
  const ok = !!sig && sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  if (!ok) return res.status(403).json({ error: 'Invalid CSRF token' });
  next();
}`
        }
      }
    ],
    summary: [
      "CSRF lợi dụng việc trình duyệt tự gửi cookie để thực hiện hành động thay nạn nhân.",
      "Chỉ ảnh hưởng xác thực dựa trên cookie; Bearer token do JS gắn không bị CSRF kiểu này.",
      "Phòng thủ nhiều lớp: SameSite, kiểm tra Origin, CSRF token (ký gắn với session).",
      "GET không bao giờ được thay đổi trạng thái."
    ],
    pitfalls: [
      "Endpoint `GET /logout` hoặc `GET /delete?id=` thay đổi dữ liệu: một thẻ `<img>` trên trang khác là đủ để kích hoạt. Dùng POST/DELETE.",
      "Chỉ dựa vào SameSite mà quên rằng các subdomain khác vẫn là \"same-site\". Thêm CSRF token hoặc kiểm tra Origin.",
      "So sánh token bằng `===` và không gắn với session, token của phiên này dùng được cho phiên khác. Ký bằng HMAC với session id và so bằng timingSafeEqual."
    ],
    quiz: [
      {
        q: "Vì sao API dùng `Authorization: Bearer` do JavaScript gắn không bị CSRF kiểu truyền thống?",
        options: [
          "Vì Bearer token luôn được mã hoá bằng JWE",
          "Vì Bearer token luôn có hạn dưới 15 phút",
          "Vì trình duyệt không tự đính kèm header đó",
          "Vì CORS chặn mọi request cross-site tới API"
        ],
        answer: 2,
        explain: "CSRF dựa vào thông tin xác thực trình duyệt tự đính kèm như cookie. Trang của kẻ tấn công không có token để tự gắn vào header."
      },
      {
        q: "Tại sao CSRF token chống được CSRF?",
        options: [
          "Vì token làm server xử lý request nhanh hơn",
          "Vì token dùng để mã hoá body của request",
          "Vì token thay thế hoàn toàn cookie phiên",
          "Vì trang kẻ tấn công không đọc được token"
        ],
        answer: 3,
        explain: "Same-Origin Policy ngăn trang khác đọc token từ trang của bạn, nên request giả mạo thiếu token và bị từ chối."
      },
      {
        q: "Với SameSite=Lax, loại request cross-site nào vẫn mang cookie?",
        options: [
          "Điều hướng cấp cao nhất bằng GET",
          "Form POST tự submit từ site khác",
          "fetch() với method PUT từ site khác",
          "Form POST bên trong iframe cross-site"
        ],
        answer: 0,
        explain: "Lax cho phép cookie trong điều hướng cấp cao nhất bằng GET. Vì vậy GET không được có tác dụng phụ."
      }
    ]
  },

  "p05.m2.t4": {
    videos: [
      { id: "eNuJLp4DJcI", title: "Giới thiệu về CORS | Cross Origin Resource Sharing", channel: "Ông Dev", lang: "vi", minutes: 4, embed: true },
      { id: "PNtFSVU-YTI", title: "Learn CORS In 6 Minutes", channel: "Web Dev Simplified", lang: "en", minutes: 6, embed: true }
    ],
    sections: [
      {
        h: "Same-Origin Policy và CORS",
        p: [
          "Trình duyệt áp dụng Same-Origin Policy: JavaScript trên `https://app.devpath.vn` không được đọc response từ origin khác (khác scheme, host hoặc port), ví dụ `https://api.devpath.vn`. Đây là hàng rào bảo vệ người dùng, không cho trang độc hại đọc dữ liệu từ những site họ đang đăng nhập.",
          "CORS (Cross-Origin Resource Sharing) là cơ chế để server nới lỏng hàng rào đó một cách có kiểm soát: server trả header `Access-Control-Allow-Origin` để cho trình duyệt biết origin nào được phép đọc response.",
          "Điều quan trọng: CORS là cơ chế của trình duyệt, không phải cơ chế bảo mật của server. Với request đơn giản, request vẫn tới server và được xử lý; trình duyệt chỉ chặn JavaScript đọc kết quả. curl, Postman, script backend bỏ qua CORS hoàn toàn. CORS không thay thế xác thực, phân quyền hay chống CSRF."
        ]
      },
      {
        h: "Preflight hoạt động thế nào?",
        p: [
          "Với request \"không đơn giản\" (method PUT/PATCH/DELETE, header tuỳ chỉnh như `Authorization`, `Content-Type: application/json`), trình duyệt gửi trước một request `OPTIONS` (preflight) để hỏi server có cho phép không. Server trả về các header `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`, `Access-Control-Max-Age`. Chỉ khi hợp lệ, trình duyệt mới gửi request thật."
        ],
        code: {
          lang: "text",
          file: "preflight.txt",
          src: `OPTIONS /api/orders HTTP/1.1
Origin: https://app.devpath.vn
Access-Control-Request-Method: PATCH
Access-Control-Request-Headers: content-type, authorization

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.devpath.vn
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
Access-Control-Allow-Headers: content-type, authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 600
Vary: Origin`
        }
      },
      {
        h: "Cấu hình đúng trong NestJS",
        p: [
          "Khi frontend cần gửi cookie (`credentials: 'include'`), server phải trả `Access-Control-Allow-Credentials: true` và một origin cụ thể. Trình duyệt từ chối kết hợp `Access-Control-Allow-Origin: *` với credentials. Một lỗi phổ biến để \"cho chạy được\" là phản chiếu nguyên giá trị header `Origin` của request, tương đương cho mọi site đọc dữ liệu người dùng đã đăng nhập.",
          "Hãy dùng danh sách origin cố định theo môi trường, so khớp chính xác (không dùng `endsWith('devpath.vn')` vì `evil-devpath.vn` cũng khớp)."
        ],
        code: {
          lang: "typescript",
          file: "main.ts",
          src: `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowed = (process.env.CORS_ORIGINS ?? 'https://app.devpath.vn').split(',');

  app.enableCors({
    origin: (origin, cb) => {
      // Không có Origin: request không từ trình duyệt (curl, server-to-server)
      if (!origin || allowed.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    maxAge: 600,
  });
  await app.listen(3000);
}
bootstrap();`
        }
      }
    ],
    summary: [
      "Same-Origin Policy ngăn JavaScript đọc response khác origin; CORS cho server nới lỏng có kiểm soát.",
      "CORS do trình duyệt thực thi; không bảo vệ server khỏi curl hay script backend.",
      "Request không đơn giản có preflight OPTIONS trước.",
      "Credentials không được đi kèm `*`; dùng whitelist origin so khớp chính xác và `Vary: Origin`."
    ],
    pitfalls: [
      "Phản chiếu mọi `Origin` kèm `Allow-Credentials: true`, bất kỳ trang nào cũng đọc được dữ liệu của người dùng đang đăng nhập.",
      "Nghĩ rằng CORS chặn được request POST từ site khác nên bỏ qua CSRF. Request đơn giản vẫn tới server và được xử lý.",
      "So khớp origin bằng `includes`/`endsWith`, domain của kẻ tấn công vẫn khớp. So khớp chính xác từng origin."
    ],
    quiz: [
      {
        q: "Phát biểu nào đúng về CORS?",
        options: [
          "CORS chặn mọi client lạ gọi tới API của bạn",
          "CORS do trình duyệt thực thi, curl bỏ qua được",
          "CORS có thể thay thế bước xác thực người dùng",
          "CORS mã hoá response giữa hai origin"
        ],
        answer: 1,
        explain: "CORS chỉ có hiệu lực trong trình duyệt. Client khác như curl bỏ qua nó, nên API vẫn cần xác thực và phân quyền."
      },
      {
        q: "Cấu hình nào bị trình duyệt từ chối?",
        options: [
          "Allow-Origin: https://app.devpath.vn cùng Allow-Credentials: true",
          "Allow-Origin: * không kèm credentials",
          "Allow-Origin: * cùng Allow-Credentials: true",
          "Không trả header CORS cho request cùng origin"
        ],
        answer: 2,
        explain: "Khi request có credentials, trình duyệt yêu cầu origin cụ thể; wildcard bị từ chối. Các cấu hình còn lại hợp lệ."
      },
      {
        q: "Khi nào trình duyệt gửi preflight OPTIONS?",
        options: [
          "Với mọi request, kể cả cùng origin",
          "Chỉ khi server yêu cầu bằng header",
          "Chỉ với request GET cùng origin",
          "Với request cross-origin như PATCH"
        ],
        answer: 3,
        explain: "Preflight dành cho request cross-origin dùng method (PUT, PATCH, DELETE) hoặc header (Authorization, Content-Type: application/json) ngoài nhóm \"đơn giản\". Request cùng origin không cần CORS."
      }
    ]
  },

  "p05.m2.t5": {
    videos: [
      { id: "Gk3_Q-3R6jc", title: "Server-Side Request Forgery (SSRF) Explained", channel: "NahamSec", lang: "en", minutes: 16, embed: true }
    ],
    sections: [
      {
        h: "SSRF: server bị lợi dụng để gửi request",
        p: [
          "Server-Side Request Forgery xảy ra khi server tải một URL do người dùng cung cấp: webhook, avatar từ URL, xem trước link, import file từ URL, chuyển đổi HTML sang PDF. Kẻ tấn công đưa URL trỏ vào mạng nội bộ, và server của bạn, vốn nằm sau firewall, gửi request thay họ.",
          "Mục tiêu điển hình là dịch vụ metadata của cloud tại `169.254.169.254`, nơi có thể trả về thông tin instance và thậm chí credential tạm thời của IAM role. Mục tiêu khác: admin panel nội bộ, Redis/Elasticsearch không có mật khẩu, API của service khác trong cluster. Trong OWASP Top 10:2025, SSRF được xếp vào A01 Broken Access Control."
        ]
      },
      {
        h: "Phòng thủ nhiều lớp",
        list: [
          "Nếu được, dùng allowlist domain (chỉ tải ảnh từ các CDN đã biết). Đây là cách mạnh nhất.",
          "Chỉ cho phép scheme `http`/`https`, chặn `file:`, `gopher:`, `ftp:`.",
          "Phân giải DNS rồi kiểm tra MỌI địa chỉ IP trả về: chặn loopback (127.0.0.0/8, ::1), private (10/8, 172.16/12, 192.168/16, fc00::/7), link-local (169.254/16, fe80::/10), 0.0.0.0/8.",
          "Kết nối tới đúng IP đã kiểm tra để chống DNS rebinding (tên miền trả IP công khai lúc kiểm tra nhưng IP nội bộ lúc kết nối).",
          "Không tự động theo redirect, hoặc kiểm tra lại từng bước redirect.",
          "Ở tầng hạ tầng: bật IMDSv2 trên AWS (yêu cầu token qua PUT), chạy tác vụ tải URL trong network egress bị giới hạn, đặt timeout và giới hạn kích thước response."
        ],
        p: [
          "Không có biện pháp đơn lẻ nào đủ, vì có nhiều cách biểu diễn địa chỉ IP (thập phân, hex, IPv6 ánh xạ IPv4). Vì vậy hãy kiểm tra trên IP đã phân giải thay vì so chuỗi hostname."
        ]
      },
      {
        h: "Ví dụ kiểm tra trong Node.js",
        p: [
          "Đoạn code dưới dùng `net.BlockList` có sẵn trong Node.js để kiểm tra IP sau khi phân giải. Để chống DNS rebinding triệt để, bạn cần kết nối bằng chính IP đã kiểm tra (ví dụ qua tuỳ chọn `lookup` của HTTP agent), hoặc đưa việc tải URL qua một egress proxy có luật chặn mạng nội bộ."
        ],
        code: {
          lang: "typescript",
          file: "safe-fetch.ts",
          src: `import { lookup } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';

const blocked = new BlockList();
blocked.addSubnet('0.0.0.0', 8);
blocked.addSubnet('10.0.0.0', 8);
blocked.addSubnet('127.0.0.0', 8);
blocked.addSubnet('169.254.0.0', 16);
blocked.addSubnet('172.16.0.0', 12);
blocked.addSubnet('192.168.0.0', 16);
blocked.addSubnet('100.64.0.0', 10);
blocked.addAddress('::1', 'ipv6');
blocked.addSubnet('fc00::', 7, 'ipv6');
blocked.addSubnet('fe80::', 10, 'ipv6');

export async function assertPublicUrl(raw: string): Promise<URL> {
  const url = new URL(raw);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Scheme không được phép');
  const host = url.hostname.replace(/^\\[|\\]$/g, '');
  const addrs = isIP(host) ? [{ address: host, family: isIP(host) }] : await lookup(host, { all: true });
  for (const a of addrs) {
    const type = a.family === 6 ? 'ipv6' : 'ipv4';
    if (blocked.check(a.address, type)) throw new Error('Địa chỉ nội bộ bị chặn');
  }
  return url;
}

// Dùng: không theo redirect tự động, có timeout
const url = await assertPublicUrl(userInput);
const res = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(5000) });`
        }
      }
    ],
    summary: [
      "SSRF: server tải URL người dùng đưa vào và bị lợi dụng để gọi mạng nội bộ.",
      "Mục tiêu nguy hiểm nhất là metadata cloud 169.254.169.254 chứa credential tạm thời.",
      "Ưu tiên allowlist domain; nếu không, kiểm tra mọi IP đã phân giải, chặn dải nội bộ và link-local.",
      "Chống DNS rebinding, không tự theo redirect, dùng IMDSv2 và giới hạn egress."
    ],
    pitfalls: [
      "Chặn bằng cách so chuỗi `hostname === 'localhost'`: `127.1`, `0x7f000001` hay một domain trỏ về 127.0.0.1 đều vượt qua. Kiểm tra trên IP đã phân giải.",
      "Kiểm tra URL ban đầu nhưng để fetch tự theo redirect sang `http://169.254.169.254/`. Tắt redirect tự động hoặc kiểm tra lại từng bước.",
      "Chỉ nghĩ tới IPv4 mà quên IPv6 (::1, fc00::/7, IPv6 ánh xạ IPv4). Chặn cả hai họ địa chỉ."
    ],
    quiz: [
      {
        q: "Vì sao địa chỉ 169.254.169.254 là mục tiêu phổ biến của SSRF trên cloud?",
        options: [
          "Vì đó là metadata service, có thể trả credential",
          "Vì đó là DNS server công cộng của cloud",
          "Vì đó là địa chỉ nội bộ của load balancer",
          "Vì đó là địa chỉ broadcast của VPC"
        ],
        answer: 0,
        explain: "Metadata service link-local chỉ truy cập được từ bên trong instance; SSRF biến server thành cầu nối để đọc nó."
      },
      {
        q: "DNS rebinding vượt qua kiểm tra SSRF như thế nào?",
        options: [
          "Mã hoá URL bằng percent-encoding để qua bộ lọc",
          "DNS trả IP công khai lúc kiểm tra, IP nội bộ lúc kết nối",
          "Dùng HTTPS để bộ lọc không đọc được hostname",
          "Gửi thật nhiều request cho đến khi bộ lọc quá tải"
        ],
        answer: 1,
        explain: "Nếu kiểm tra và kết nối phân giải DNS hai lần, kẻ tấn công đổi kết quả ở giữa. Cách phòng là kết nối bằng đúng IP đã kiểm tra."
      },
      {
        q: "Biện pháp mạnh nhất khi tính năng chỉ cần tải ảnh từ vài CDN đã biết?",
        options: [
          "Chặn chuỗi \"localhost\"",
          "Chỉ dùng HTTPS",
          "Allowlist các domain CDN được phép",
          "Tăng timeout"
        ],
        answer: 2,
        explain: "Allowlist thu hẹp đích đến về những nơi đã biết, loại bỏ gần như mọi vector SSRF. Chặn chuỗi dễ bị vượt qua; HTTPS và timeout không ngăn truy cập nội bộ."
      }
    ]
  },

  "p05.m2.t6": {
    videos: [
      { id: "YXkOdWBwqaA", title: "Rate Limiter System Design: Token Bucket, Leaky Bucket, Scaling", channel: "ByteByteGo", lang: "en", minutes: 8, embed: true }
    ],
    sections: [
      {
        h: "Vì sao cần rate limiting?",
        p: [
          "Không có giới hạn, một endpoint đăng nhập có thể bị thử hàng triệu mật khẩu (brute-force) hoặc hàng triệu cặp email/mật khẩu rò rỉ từ site khác (credential stuffing). Endpoint gửi OTP qua SMS có thể bị lạm dụng để đốt tiền của bạn. Endpoint tìm kiếm nặng có thể bị dùng để làm quá tải DB.",
          "Rate limiting giới hạn số request trong một khoảng thời gian theo một khoá: IP, user id, API key, hoặc tổ hợp (IP + email). Khi vượt ngưỡng, trả `429 Too Many Requests` kèm header `Retry-After`. Cần lưu bộ đếm trong Redis để mọi instance dùng chung."
        ]
      },
      {
        h: "Cấu hình trong NestJS",
        p: [
          "`@nestjs/throttler` cung cấp guard giới hạn theo IP mặc định. Bạn đặt giới hạn chung cho toàn ứng dụng và giới hạn chặt hơn cho endpoint nhạy cảm. Chú ý đơn vị: từ `@nestjs/throttler` v5, `ttl` tính bằng mili giây (bài viết cũ dùng giây sẽ sai 1000 lần). Mặc định bộ đếm nằm trong bộ nhớ của từng process; khi chạy nhiều instance, cấu hình tuỳ chọn `storage` bằng một storage Redis (ví dụ package cộng đồng `@nest-lab/throttler-storage-redis`). Nếu ứng dụng đứng sau load balancer, cấu hình `trust proxy` đúng số tầng để lấy IP thật của client, nếu không mọi người dùng sẽ có chung IP của proxy (hoặc tệ hơn, kẻ tấn công tự giả mạo `X-Forwarded-For`)."
        ],
        code: {
          lang: "typescript",
          file: "app.module.ts",
          src: `import { Body, Controller, Module, Post } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule, Throttle } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]), // 100 request/phút/IP
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}

// auth.controller.ts: siết chặt endpoint đăng nhập
@Controller('auth')
export class AuthController {
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  login(@Body() dto: LoginDto) { /* ... */ }
}

// main.ts (Express): đứng sau 1 tầng proxy tin cậy
// app.getHttpAdapter().getInstance().set('trust proxy', 1);`
        }
      },
      {
        h: "Chống brute-force cho đăng nhập",
        list: [
          "Giới hạn theo cả IP lẫn tài khoản: IP chặn một máy thử nhiều tài khoản; theo tài khoản chặn botnet nhiều IP cùng tấn công một tài khoản.",
          "Lockout mềm thay vì khoá cứng: khoá cứng sau 5 lần sai cho phép kẻ xấu cố tình khoá tài khoản của người khác (DoS). Tốt hơn là tăng dần độ trễ hoặc khoá tạm thời 15 phút, kèm email thông báo.",
          "CAPTCHA (Cloudflare Turnstile, reCAPTCHA, hCaptcha) chỉ hiện khi có dấu hiệu bất thường, để người dùng bình thường không bị làm phiền.",
          "Kiểm tra mật khẩu đã lộ khi đăng ký/đổi mật khẩu, và khuyến khích MFA: đây mới là biện pháp giải quyết tận gốc credential stuffing.",
          "Ghi log và cảnh báo khi tỉ lệ đăng nhập thất bại tăng đột biến."
        ],
        p: [
          "Thông báo lỗi nên chung chung (\"Email hoặc mật khẩu không đúng\") để không giúp kẻ tấn công biết email nào tồn tại."
        ]
      }
    ],
    summary: [
      "Rate limiting chống brute-force, credential stuffing, lạm dụng tài nguyên và chi phí.",
      "Trả 429 kèm Retry-After; lưu bộ đếm trong Redis khi có nhiều instance.",
      "Cấu hình trust proxy đúng để lấy IP thật, không tin X-Forwarded-For tùy ý.",
      "Đăng nhập: giới hạn theo IP và tài khoản, lockout mềm, CAPTCHA khi bất thường, MFA."
    ],
    pitfalls: [
      "Khoá cứng tài khoản sau vài lần sai, kẻ tấn công khoá hàng loạt tài khoản người dùng thật. Dùng độ trễ tăng dần hoặc khoá tạm thời.",
      "Lưu bộ đếm trong RAM từng instance, giới hạn thực tế nhân lên theo số instance. Dùng Redis.",
      "Đặt `trust proxy` là `true` khi app lộ trực tiếp ra Internet, kẻ tấn công tự đặt `X-Forwarded-For` để né giới hạn."
    ],
    quiz: [
      {
        q: "Vì sao chỉ giới hạn theo IP là chưa đủ cho endpoint đăng nhập?",
        options: [
          "Vì mọi client đều có chung một địa chỉ IP",
          "Vì IP là dữ liệu cá nhân nên không được lưu",
          "Vì Redis không lưu được địa chỉ IPv6",
          "Vì botnet dùng nhiều IP cho cùng một tài khoản"
        ],
        answer: 3,
        explain: "Mỗi IP chỉ thử vài lần là dưới ngưỡng, nhưng tổng hàng nghìn IP thì thành brute-force. Kết hợp giới hạn theo tài khoản."
      },
      {
        q: "Mã HTTP chuẩn khi client vượt giới hạn tốc độ là gì?",
        options: ["401", "403", "429", "503"],
        answer: 2,
        explain: "429 Too Many Requests, thường kèm Retry-After. 401 là chưa xác thực, 403 là không có quyền, 503 là dịch vụ không sẵn sàng."
      },
      {
        q: "Rủi ro của việc khoá cứng tài khoản sau 5 lần đăng nhập sai là gì?",
        options: [
          "Không có rủi ro, càng khoá sớm càng an toàn",
          "Kẻ xấu cố tình khoá tài khoản người dùng thật",
          "Làm hash mật khẩu trong DB yếu đi",
          "Làm lộ mật khẩu qua thông báo lỗi"
        ],
        answer: 1,
        explain: "Chỉ cần biết email là có thể khoá tài khoản nạn nhân. Khoá tạm thời, độ trễ tăng dần và CAPTCHA cân bằng tốt hơn."
      }
    ]
  },

  "p05.m2.t7": {
    videos: [
      { id: "4bQeGUzHpOE", title: "HTTP Secure Headers for Web App Security | CORS, CSP, HSTS and more", channel: "ByteMonk", lang: "en", minutes: 8, embed: true }
    ],
    sections: [
      {
        h: "Security header: cấu hình rẻ, hiệu quả cao",
        p: [
          "Security header là các header HTTP yêu cầu trình duyệt bật thêm cơ chế bảo vệ. Chúng không sửa lỗ hổng trong code, nhưng chặn cả một lớp tấn công với chi phí gần như bằng không. Thiếu header thuộc nhóm A02 Security Misconfiguration.",
          "Header cần đặt ở response HTML và API; nếu có reverse proxy (Nginx, CDN), có thể đặt ở đó để áp dụng thống nhất, nhưng tránh đặt trùng ở hai nơi với giá trị mâu thuẫn."
        ]
      },
      {
        h: "Các header quan trọng",
        list: [
          "`Strict-Transport-Security` (HSTS): buộc trình duyệt chỉ dùng HTTPS với domain trong thời gian `max-age`, chống tấn công hạ cấp xuống HTTP. Ví dụ `max-age=31536000; includeSubDomains`. Chỉ thêm `preload` khi chắc chắn mọi subdomain đều có HTTPS, vì gỡ khỏi danh sách preload mất nhiều thời gian.",
          "`X-Content-Type-Options: nosniff`: không cho trình duyệt đoán kiểu nội dung, tránh một file upload \"ảnh\" bị chạy như script.",
          "`Content-Security-Policy` với `frame-ancestors 'none'` (hoặc `'self'`): chống clickjacking bằng cách không cho trang khác nhúng trang của bạn vào iframe. Đây là cách hiện đại thay cho `X-Frame-Options: DENY` (vẫn nên giữ cho trình duyệt cũ).",
          "`Referrer-Policy: strict-origin-when-cross-origin` hoặc `no-referrer`: không lộ đường dẫn đầy đủ (có thể chứa token) sang site khác.",
          "`Permissions-Policy`: tắt các API trình duyệt không dùng như camera, microphone, geolocation.",
          "`Cross-Origin-Opener-Policy: same-origin`: cô lập cửa sổ khỏi trang mở nó."
        ],
        p: [
          "Header `X-XSS-Protection` đã lỗi thời; các trình duyệt hiện đại đã bỏ bộ lọc XSS, nên giá trị khuyến nghị là `0` (tắt) và dựa vào CSP."
        ]
      },
      {
        h: "Dùng helmet trong NestJS/Express",
        p: [
          "`helmet` là middleware đặt sẵn một bộ header an toàn với giá trị mặc định hợp lý, bao gồm CSP cơ bản, HSTS, nosniff, frame-ancestors, Referrer-Policy và bỏ header `X-Powered-By` (lộ công nghệ server). Bạn chỉ cần tinh chỉnh CSP theo tài nguyên của ứng dụng. Kiểm tra kết quả bằng DevTools hoặc các công cụ quét header trực tuyến."
        ],
        code: {
          lang: "typescript",
          file: "main.ts",
          src: `import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https://cdn.devpath.vn'],
          frameAncestors: ["'none'"],
          objectSrc: ["'none'"],
        },
      },
      strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );
  await app.listen(3000);
}
bootstrap();`
        }
      }
    ],
    summary: [
      "Security header là lớp bảo vệ rẻ; thiếu chúng thuộc A02 Security Misconfiguration.",
      "HSTS buộc HTTPS; nosniff chống đoán kiểu nội dung; frame-ancestors chống clickjacking.",
      "Referrer-Policy và Permissions-Policy giảm rò rỉ thông tin và bề mặt tấn công.",
      "Dùng helmet để có bộ mặc định tốt, rồi tinh chỉnh CSP."
    ],
    pitfalls: [
      "Bật HSTS `preload` khi còn subdomain chạy HTTP, các subdomain đó không truy cập được và khó gỡ. Bật dần max-age và kiểm tra kỹ trước khi preload.",
      "Đặt header ở cả Nginx và ứng dụng với giá trị khác nhau, trình duyệt nhận hai header mâu thuẫn. Chọn một nơi quản lý.",
      "Bật `X-XSS-Protection: 1; mode=block` và nghĩ là đã chống XSS. Header này lỗi thời; dùng CSP và escape output."
    ],
    quiz: [
      {
        q: "Header nào chống clickjacking theo cách hiện đại?",
        options: [
          "X-Content-Type-Options",
          "Strict-Transport-Security",
          "Content-Security-Policy: frame-ancestors",
          "Referrer-Policy"
        ],
        answer: 2,
        explain: "frame-ancestors kiểm soát ai được nhúng trang vào iframe, thay thế X-Frame-Options. Các header còn lại có mục đích khác."
      },
      {
        q: "HSTS bảo vệ khỏi điều gì?",
        options: [
          "SQL injection qua form đăng nhập",
          "Brute-force mật khẩu từ nhiều IP",
          "XSS từ script của bên thứ ba",
          "Kết nối bị hạ cấp xuống HTTP thường"
        ],
        answer: 3,
        explain: "HSTS khiến trình duyệt tự dùng HTTPS cho domain, không gửi request HTTP có thể bị chặn giữa đường."
      },
      {
        q: "`X-Content-Type-Options: nosniff` có tác dụng gì?",
        options: [
          "Cấm trình duyệt tự đoán kiểu nội dung",
          "Yêu cầu trình duyệt không nén response",
          "Chặn trình duyệt lưu cookie của trang",
          "Buộc trình duyệt chuyển sang HTTPS"
        ],
        answer: 0,
        explain: "Không cho MIME sniffing giúp một file khai báo là ảnh hay văn bản không bị trình duyệt thực thi như script."
      }
    ]
  },

  "p05.m3.t0": {
    videos: [
      { id: "BqekRTA6VCs", title: "Secrets Management: Secure Credentials & Avoid Data Leaks", channel: "IBM Technology", lang: "en", minutes: 10, embed: true }
    ],
    sections: [
      {
        h: "Secret là gì và rò rỉ từ đâu?",
        p: [
          "Secret là mọi thông tin cho phép truy cập hệ thống: mật khẩu database, API key thanh toán, khoá ký JWT, token của dịch vụ email, private key TLS. Một secret bị lộ thường nguy hiểm hơn một lỗ hổng code, vì kẻ tấn công vào thẳng bằng \"cửa chính\".",
          "Các đường rò rỉ phổ biến: commit file `.env` lên git (kể cả repo private, vì lịch sử git giữ mãi), in biến môi trường ra log khi debug, đưa secret vào image Docker, dán vào tin nhắn chat, và secret được build vào bundle frontend (mọi biến `NEXT_PUBLIC_`/`VITE_` đều công khai)."
        ]
      },
      {
        h: ".env chỉ cho local, production dùng secret manager",
        p: [
          "File `.env` tiện cho máy dev: thêm vào `.gitignore`, commit một file `.env.example` chỉ có tên biến. Node.js hiện đại đọc được trực tiếp bằng cờ `--env-file=.env`, không cần thư viện.",
          "Production cần một nơi lưu tập trung, mã hoá, có phân quyền và ghi log truy cập: HashiCorp Vault, AWS Secrets Manager, SSM Parameter Store (SecureString), GCP Secret Manager, Azure Key Vault. Ứng dụng lấy secret lúc khởi động bằng danh tính của chính nó (IAM role, workload identity) thay vì một access key cố định. Trên Kubernetes, Secret mặc định chỉ được mã hoá base64, không phải mã hoá; hãy bật encryption at rest cho etcd hoặc đồng bộ từ secret manager bằng External Secrets Operator."
        ],
        code: {
          lang: "typescript",
          file: "config.ts",
          src: `import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { z } from 'zod';

const Secrets = z.object({
  DATABASE_URL: z.url(), // Zod 4; bản 3 viết z.string().url()
  JWT_SECRET: z.string().min(32),
  STRIPE_API_KEY: z.string().startsWith('sk_'),
});

export async function loadSecrets() {
  if (process.env.NODE_ENV !== 'production') {
    return Secrets.parse(process.env); // local: node --env-file=.env dist/main.js
  }
  // production: quyền đọc đến từ IAM role của task/pod, không có access key trong code
  const client = new SecretsManagerClient({ region: 'ap-southeast-1' });
  const out = await client.send(new GetSecretValueCommand({ SecretId: 'devpath/api/prod' }));
  return Secrets.parse(JSON.parse(out.SecretString ?? '{}')); // fail fast nếu thiếu secret
}`
        }
      },
      {
        h: "Rotate và phản ứng khi lộ",
        p: [
          "Rotation (thay secret định kỳ) giới hạn thời gian một secret bị lộ có thể bị dùng. Secrets Manager và Vault hỗ trợ tự động rotate mật khẩu DB; Vault còn có dynamic secrets, cấp cho mỗi instance một tài khoản DB ngắn hạn riêng. Để rotate không downtime, hệ thống phải chấp nhận cả khoá cũ và mới trong giai đoạn chuyển tiếp (ví dụ JWKS có hai khoá với `kid` khác nhau).",
          "Khi phát hiện secret bị commit: coi như đã lộ. Thu hồi và thay ngay, rồi mới dọn lịch sử git; xoá commit không làm secret an toàn trở lại. Phòng ngừa bằng công cụ quét như gitleaks trong pre-commit hook và CI, cùng tính năng secret scanning/push protection của GitHub."
        ]
      }
    ],
    summary: [
      ".env chỉ dùng ở local và nằm trong .gitignore; commit .env.example.",
      "Production dùng secret manager, truy cập bằng danh tính workload thay vì access key cố định.",
      "Validate cấu hình khi khởi động để fail fast; không in secret ra log.",
      "Rotate định kỳ, hỗ trợ khoá cũ và mới song song; secret đã commit phải thu hồi ngay.",
      "Quét secret bằng gitleaks/secret scanning trong pre-commit và CI."
    ],
    pitfalls: [
      "Xoá file `.env` khỏi commit mới nhất và nghĩ là xong; secret vẫn nằm trong lịch sử git. Thu hồi và thay secret.",
      "Đặt API key vào biến `VITE_`/`NEXT_PUBLIC_` để frontend gọi thẳng dịch vụ bên thứ ba: key bị nhúng vào bundle công khai. Gọi qua backend.",
      "Dùng chung một secret cho mọi môi trường, lộ ở staging là lộ production. Mỗi môi trường một bộ secret riêng."
    ],
    quiz: [
      {
        q: "Bạn phát hiện file `.env` chứa mật khẩu DB production đã bị push lên GitHub. Việc đầu tiên nên làm?",
        options: [
          "Xoá file khỏi lịch sử rồi force push",
          "Đổi mật khẩu DB ngay, coi như đã lộ",
          "Chuyển repo sang private ngay lập tức",
          "Bỏ qua nếu repo ít người theo dõi"
        ],
        answer: 1,
        explain: "Secret đã lên remote có thể đã bị bot quét trong vài phút. Chỉ thay secret mới vô hiệu hoá được nó; dọn lịch sử là bước sau."
      },
      {
        q: "Phát biểu nào đúng về Kubernetes Secret mặc định?",
        options: [
          "Được mã hoá AES trong etcd theo mặc định",
          "Không ai đọc được, kể cả cluster admin",
          "Chỉ là base64, ai có quyền đọc là giải được",
          "Tự động rotate giá trị theo chu kỳ 90 ngày"
        ],
        answer: 2,
        explain: "Base64 chỉ là cách mã hoá hiển thị, ai có quyền đọc Secret đều giải được. Encryption at rest cho etcd và phân quyền RBAC là cần thiết."
      },
      {
        q: "Vì sao ứng dụng nên truy cập secret manager bằng IAM role/workload identity?",
        options: [
          "Vì lấy secret bằng IAM role nhanh hơn",
          "Vì AWS SDK cho Node.js bắt buộc như vậy",
          "Vì secret manager không nhận access key",
          "Vì khỏi phải giữ thêm một access key dài hạn"
        ],
        answer: 3,
        explain: "Danh tính workload cấp credential ngắn hạn tự động, tránh bài toán \"secret để lấy secret\"."
      }
    ]
  },

  "p05.m3.t1": {
    videos: [
      { id: "-MmyAFR_pYw", title: "NPM Supply Chain Attacks Explained (And How To Stop Them)", channel: "DigitalOcean", lang: "en", minutes: 10, embed: true }
    ],
    sections: [
      {
        h: "Chuỗi cung ứng phần mềm là bề mặt tấn công",
        p: [
          "Một dự án NestJS điển hình kéo về hàng trăm đến hàng nghìn package gián tiếp. Mỗi package là code của người lạ chạy với toàn quyền của ứng dụng, và nhiều package chạy script `postinstall` ngay lúc cài đặt trên máy dev hoặc CI. Đó là lý do Software Supply Chain Failures trở thành A03 trong OWASP Top 10:2025.",
          "Các kiểu tấn công thực tế: chiếm tài khoản maintainer rồi phát hành phiên bản độc hại của một package phổ biến (năm 2025 đã có các vụ như vậy trên npm, kể cả dạng worm tự lây sang package khác), typosquatting (đặt tên gần giống như `expresss`), dependency confusion (package công khai trùng tên package nội bộ), và lỗ hổng thông thường trong package cũ."
        ]
      },
      {
        h: "Lockfile, npm ci và audit",
        list: [
          "Commit `package-lock.json` (hoặc `pnpm-lock.yaml`). Lockfile ghim chính xác phiên bản và hash toàn vẹn của mọi package, kể cả gián tiếp.",
          "Trong CI và Dockerfile dùng `npm ci`: cài đúng theo lockfile, lỗi nếu lockfile lệch với package.json.",
          "`npm audit` đối chiếu dependency với cơ sở dữ liệu lỗ hổng đã công bố. Trong CI có thể chặn build với lỗ hổng mức cao ở dependency production.",
          "`npm audit signatures` kiểm tra chữ ký registry và provenance attestation của package.",
          "Cân nhắc tắt lifecycle script mặc định (`--ignore-scripts`) và chỉ cho phép với package cần build native. pnpm 10 mặc định không chạy script của dependency trừ khi được cho phép."
        ],
        p: [
          "Đây là các biện pháp nền tảng, gần như không tốn chi phí và nên có trong mọi pipeline."
        ],
        code: {
          lang: "bash",
          file: "ci-security.sh",
          src: `# Cài đúng theo lockfile, không chạy lifecycle script
npm ci --ignore-scripts

# Chặn build nếu dependency production có lỗ hổng mức high trở lên
npm audit --omit=dev --audit-level=high

# Kiểm tra chữ ký và provenance của package đã cài
npm audit signatures

# Xem vì sao một package có mặt trong cây dependency
npm explain minimist`
        }
      },
      {
        h: "Cập nhật tự động và chọn package",
        p: [
          "Dependabot hoặc Renovate tự mở pull request cập nhật dependency, kèm changelog. Cập nhật đều đặn từng chút dễ hơn nhiều so với nâng cấp dồn một lần sau hai năm. Gom nhóm các bản vá nhỏ để giảm số PR, và để CI (test + audit) quyết định có merge hay không.",
          "Trước khi thêm package mới, hãy hỏi: có thật sự cần không (nhiều tiện ích đã có sẵn trong Node.js 24 như `fetch`, `crypto.randomUUID`, test runner)? Package có được bảo trì, có nhiều người dùng, có repo nguồn rõ ràng không? Có đòi quyền cài đặt lạ không? Ít dependency hơn là bề mặt tấn công nhỏ hơn."
        ],
        code: {
          lang: "yaml",
          file: ".github/dependabot.yml",
          src: `version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    groups:
      minor-and-patch:
        update-types: ["minor", "patch"]
    cooldown:
      default-days: 7        # chỉ đề xuất bản đã phát hành ít nhất 7 ngày
    open-pull-requests-limit: 10
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"`
        }
      }
    ],
    summary: [
      "Dependency là code của người khác chạy với toàn quyền; supply chain là A03 trong OWASP Top 10:2025.",
      "Commit lockfile, dùng `npm ci` trong CI và Docker.",
      "`npm audit` và `npm audit signatures` trong CI; cân nhắc `--ignore-scripts`.",
      "Dependabot/Renovate cập nhật đều đặn; đánh giá kỹ trước khi thêm package mới."
    ],
    pitfalls: [
      "Dùng `npm install` trong CI, phiên bản có thể trôi khác với máy dev. Dùng `npm ci`.",
      "Bỏ qua cảnh báo audit mãi vì \"toàn lỗi dev dependency\" và rồi bỏ lỡ lỗi thật ở production dependency. Tách `--omit=dev` và xử lý lỗi production.",
      "Cài package vừa được phát hành vài giờ trước vào production. Các package độc hại thường bị phát hiện và gỡ trong vài ngày; đặt độ trễ trước khi nâng cấp bằng `cooldown` của Dependabot, `minimumReleaseAge` của Renovate hoặc của pnpm."
    ],
    quiz: [
      {
        q: "Vì sao nên dùng `npm ci` thay cho `npm install` trong CI?",
        options: [
          "Vì npm ci cài đúng lockfile, lệch là báo lỗi",
          "Vì npm ci luôn cài bản mới nhất của mỗi gói",
          "Vì npm ci cài offline, không cần tải từ registry",
          "Vì npm install đã bị gỡ khỏi npm đi kèm Node.js 24"
        ],
        answer: 0,
        explain: "npm ci đảm bảo build tái lập được, đúng với những gì đã được review trong lockfile. Nó vẫn cần tải package và không cài bản mới nhất."
      },
      {
        q: "Typosquatting là gì?",
        options: [
          "Lỗi chính tả trong tên biến của code",
          "Package độc hại đặt tên gần giống gói phổ biến",
          "Package phổ biến bị maintainer bỏ bảo trì",
          "Package kéo theo quá nhiều dependency gián tiếp"
        ],
        answer: 1,
        explain: "Kẻ tấn công lợi dụng lỗi gõ nhầm tên như expresss, lodahs. Kiểm tra kỹ tên package khi cài."
      },
      {
        q: "Lợi ích của lockfile là gì?",
        options: [
          "Làm dung lượng node_modules nhỏ hơn",
          "Tự động nâng lên bản đã vá lỗ hổng",
          "Ghim phiên bản và hash của mọi package",
          "Chặn mọi package độc hại khi cài"
        ],
        answer: 2,
        explain: "Lockfile giúp mọi nơi cài cùng một cây dependency và phát hiện file bị thay đổi. Nó không tự vá lỗi hay chặn được package độc hại đã có trong lockfile."
      }
    ]
  },

  "p05.m3.t2": {
    sections: [
      {
        h: "Mã hoá khi truyền (in transit)",
        p: [
          "Mọi kết nối qua mạng phải dùng TLS, không chỉ giữa trình duyệt và server mà cả giữa các service nội bộ, tới database, Redis và dịch vụ bên thứ ba. Mạng nội bộ không phải vùng an toàn tuyệt đối: một máy bị chiếm trong VPC có thể nghe lén lưu lượng không mã hoá.",
          "Dùng TLS 1.2 trở lên (ưu tiên TLS 1.3), chứng chỉ tự động gia hạn (Let's Encrypt, ACM). Khi kết nối Postgres, dùng `sslmode=verify-full` để vừa mã hoá vừa kiểm tra chứng chỉ server; `sslmode=require` chỉ mã hoá mà không xác minh đúng server, vẫn có thể bị man-in-the-middle. Trong service mesh, mTLS cho phép cả hai bên xác thực lẫn nhau."
        ],
        code: {
          lang: "bash",
          file: ".env.example",
          src: `# Mã hoá và xác minh chứng chỉ của Postgres
DATABASE_URL="postgresql://app:***@db.internal:5432/app?sslmode=verify-full&sslrootcert=/etc/ssl/rds-ca.pem"

# Redis qua TLS dùng scheme rediss://
REDIS_URL="rediss://default:***@cache.internal:6380"`
        }
      },
      {
        h: "Mã hoá khi lưu (at rest)",
        list: [
          "Mã hoá đĩa/volume (EBS, RDS storage encryption, S3 SSE): bật gần như miễn phí, bảo vệ khi ổ đĩa hoặc snapshot bị lấy ra ngoài. Nhưng với ai truy cập được qua database thì dữ liệu vẫn là bản rõ.",
          "Mã hoá mức ứng dụng/cột: mã hoá các trường cực nhạy cảm (số CCCD, số tài khoản ngân hàng, secret TOTP) trước khi ghi DB. Kẻ đọc được DB hoặc backup vẫn không thấy bản rõ nếu không có khoá.",
          "Envelope encryption: dữ liệu được mã hoá bằng data key; data key được mã hoá bằng master key nằm trong KMS/HSM và không bao giờ rời khỏi đó. Rotate master key không cần mã hoá lại toàn bộ dữ liệu.",
          "Muốn tìm kiếm trên trường đã mã hoá, lưu thêm blind index: HMAC của giá trị với một khoá riêng, để tra cứu bằng so khớp chính xác."
        ],
        p: [
          "Mã hoá không phải hash: mã hoá là hai chiều (có khoá thì giải được), dùng cho dữ liệu cần đọc lại; mật khẩu thì hash."
        ]
      },
      {
        h: "Không tự viết thuật toán mã hoá",
        p: [
          "Mật mã học rất dễ sai theo những cách không nhìn thấy: dùng lại IV, dùng chế độ ECB, không xác thực bản mã, so sánh không hằng thời gian. Hãy dùng thuật toán chuẩn qua thư viện đã kiểm chứng: `node:crypto` với AES-256-GCM (mã hoá có xác thực), libsodium, hoặc SDK của KMS.",
          "AES-GCM yêu cầu IV (nonce) 12 byte ngẫu nhiên và KHÔNG được dùng lại với cùng một khoá. Auth tag giúp phát hiện bản mã bị sửa. Khoá lấy từ KMS hoặc secret manager, không hardcode."
        ],
        code: {
          lang: "typescript",
          file: "field-crypto.ts",
          src: `import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const KEY = Buffer.from(process.env.FIELD_KEY_BASE64!, 'base64'); // 32 byte, lấy từ secret manager

export function encrypt(plain: string): string {
  const iv = randomBytes(12); // mới cho MỖI lần mã hoá
  const cipher = createCipheriv('aes-256-gcm', KEY, iv);
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ['v1', iv.toString('base64'), tag.toString('base64'), ct.toString('base64')].join('.');
}

export function decrypt(payload: string): string {
  const [version, iv, tag, ct] = payload.split('.');
  if (version !== 'v1') throw new Error('Unknown key version');
  const decipher = createDecipheriv('aes-256-gcm', KEY, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64')); // sai tag => final() ném lỗi
  return Buffer.concat([decipher.update(Buffer.from(ct, 'base64')), decipher.final()]).toString('utf8');
}`
        }
      }
    ],
    summary: [
      "TLS cho mọi kết nối, kể cả nội bộ; Postgres dùng `sslmode=verify-full`.",
      "Mã hoá đĩa là nền tảng; trường cực nhạy cảm cần mã hoá mức ứng dụng.",
      "Envelope encryption với KMS; blind index để tra cứu trường đã mã hoá.",
      "Dùng AES-256-GCM qua thư viện chuẩn, IV ngẫu nhiên không lặp; không tự chế thuật toán."
    ],
    pitfalls: [
      "Dùng `sslmode=require` và nghĩ đã an toàn: kết nối được mã hoá nhưng không xác minh server. Dùng `verify-full` với CA đúng.",
      "Dùng IV cố định hoặc bộ đếm reset khi restart với AES-GCM, phá vỡ hoàn toàn bảo mật. Sinh IV ngẫu nhiên 12 byte mỗi lần.",
      "Lưu khoá mã hoá ngay trong cùng database với dữ liệu, lộ DB là lộ cả khoá. Đặt khoá trong KMS/secret manager."
    ],
    quiz: [
      {
        q: "Khác biệt giữa `sslmode=require` và `sslmode=verify-full` trong Postgres?",
        options: [
          "Không khác, chỉ là hai tên gọi",
          "require dùng TLS 1.3, verify-full dùng TLS 1.2",
          "verify-full kiểm tra chứng chỉ nhưng không mã hoá",
          "verify-full kiểm tra thêm CA và hostname"
        ],
        answer: 3,
        explain: "Không xác minh chứng chỉ thì kẻ đứng giữa có thể giả làm server. verify-full kiểm tra CA và tên host."
      },
      {
        q: "Vì sao chọn AES-GCM thay vì AES-CBC tự ghép?",
        options: [
          "Vì GCM phát hiện được bản mã bị sửa",
          "Vì GCM không cần quản lý khoá",
          "Vì GCM cho bản mã ngắn hơn plaintext",
          "Vì CBC đã bị gỡ khỏi node:crypto"
        ],
        answer: 0,
        explain: "GCM tạo auth tag; giải mã sẽ lỗi nếu dữ liệu bị sửa. CBC không có xác thực và cần ghép thêm MAC đúng cách, dễ sai."
      },
      {
        q: "Envelope encryption mang lại lợi ích gì?",
        options: [
          "Ứng dụng không cần dùng khoá nào",
          "Rotate master key không phải mã hoá lại dữ liệu",
          "Dữ liệu được lưu dạng rõ, chỉ khoá được mã hoá",
          "Thay thế được TLS khi truyền dữ liệu"
        ],
        answer: 1,
        explain: "Master key nằm trong KMS không rời đi; khi rotate chỉ các data key (nhỏ) được mã hoá lại. Dữ liệu vẫn được mã hoá bằng data key, và envelope encryption không thay thế TLS."
      }
    ]
  },

  "p05.m3.t3": {
    sections: [
      {
        h: "Audit log: ai đã làm gì, khi nào",
        p: [
          "Audit log ghi lại các hành động quan trọng về bảo mật và nghiệp vụ: đăng nhập thành công/thất bại, đổi mật khẩu, bật/tắt MFA, thay đổi quyền, xem hoặc xuất dữ liệu nhạy cảm, thay đổi cấu hình, thao tác của admin. Khi có sự cố, đây là nguồn duy nhất trả lời câu hỏi \"chuyện gì đã xảy ra\". Thiếu nó thuộc A09 Security Logging & Alerting Failures.",
          "Audit log khác log ứng dụng: nó có cấu trúc cố định, được giữ lâu hơn, chỉ ghi thêm (append-only) và không ai được sửa hoặc xoá, kể cả admin. Nên lưu tách biệt (bảng riêng với quyền chỉ INSERT, hoặc đẩy sang hệ thống lưu trữ riêng) và có cảnh báo cho các sự kiện đáng ngờ."
        ],
        code: {
          lang: "sql",
          file: "audit_log.sql",
          src: `CREATE TABLE audit_logs (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_id    bigint,                 -- ai làm (NULL nếu hệ thống)
  action      text NOT NULL,          -- 'user.role.granted', 'invoice.exported'
  target_type text NOT NULL,
  target_id   text,
  result      text NOT NULL CHECK (result IN ('success', 'denied', 'error')),
  ip          inet,
  request_id  text,
  metadata    jsonb NOT NULL DEFAULT '{}'  -- KHÔNG chứa mật khẩu, token, dữ liệu nhạy cảm
);

-- Role ứng dụng chỉ được thêm, không được sửa/xoá
GRANT INSERT, SELECT ON audit_logs TO app_user;
REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM app_user;`
        }
      },
      {
        h: "PII: thu thập ít, che nhiều",
        p: [
          "PII (dữ liệu cá nhân) gồm họ tên, email, số điện thoại, địa chỉ, số CCCD, IP, vị trí, và các dữ liệu nhạy cảm hơn như sức khoẻ, tài chính. Nguyên tắc tối thiểu hoá: chỉ thu thập dữ liệu thật sự cần cho mục đích đã nói rõ với người dùng, lưu trong thời gian cần thiết, và xoá hoặc ẩn danh hoá khi hết mục đích.",
          "Log là nơi PII rò rỉ nhiều nhất, vì log được gửi sang nhiều hệ thống, nhiều người đọc được và giữ lâu. Hãy che (redact) tự động ở logger thay vì trông chờ từng dev nhớ. Chỉ ghi định danh (userId) thay vì email; che bớt khi cần hiển thị (`n***@gmail.com`, `090****123`)."
        ],
        code: {
          lang: "typescript",
          file: "logger.ts",
          src: `import pino from 'pino';

export const logger = pino({
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.token',
      '*.nationalId',
      '*.phone'
    ],
    censor: '[REDACTED]',
  },
});

export function maskEmail(email: string) {
  const [name, domain] = email.split('@');
  return \`\${name.slice(0, 1)}***@\${domain}\`;
}

// logger.info({ userId: 42, action: 'profile.updated' });  // tốt: định danh, không PII`
        }
      },
      {
        h: "Tuân thủ Luật Bảo vệ dữ liệu cá nhân",
        p: [
          "Tại Việt Nam, Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 có hiệu lực từ ngày 01/01/2026. Với backend engineer, điều này biến các nguyên tắc ở trên thành nghĩa vụ pháp lý: xử lý dữ liệu phải có căn cứ (như sự đồng ý của chủ thể dữ liệu), có mục đích rõ ràng, được bảo vệ bằng biện pháp kỹ thuật phù hợp, và tôn trọng quyền của chủ thể dữ liệu như được biết, truy cập, chỉnh sửa, xoá dữ liệu của mình.",
          "Về kỹ thuật, bạn cần chuẩn bị: bản đồ dữ liệu (dữ liệu cá nhân nào nằm ở bảng, log, backup, dịch vụ bên thứ ba nào), lưu vết sự đồng ý và thời điểm, API/quy trình xuất và xoá dữ liệu theo yêu cầu, chính sách thời gian lưu trữ, mã hoá và kiểm soát truy cập, quy trình phát hiện và thông báo sự cố. Các chi tiết cụ thể như thời hạn, thủ tục và mức phạt được quy định trong luật và văn bản hướng dẫn; hãy làm việc với bộ phận pháp chế và đọc văn bản gốc thay vì dựa vào tóm tắt."
        ]
      }
    ],
    summary: [
      "Audit log ghi hành động quan trọng: ai, làm gì, trên đối tượng nào, khi nào, kết quả, từ đâu.",
      "Audit log append-only, tách biệt, có quyền chỉ INSERT và cảnh báo sự kiện đáng ngờ.",
      "Tối thiểu hoá PII; che tự động trong logger; log định danh thay vì dữ liệu cá nhân.",
      "Luật 91/2025/QH15 hiệu lực 01/01/2026: cần bản đồ dữ liệu, lưu vết đồng ý, quy trình xuất/xoá và bảo vệ dữ liệu."
    ],
    pitfalls: [
      "Ghi toàn bộ request body vào log để \"dễ debug\", mật khẩu, token, số CCCD nằm trong hệ thống log nhiều tháng. Dùng redact và log có chọn lọc.",
      "Cho role ứng dụng quyền UPDATE/DELETE bảng audit, kẻ tấn công xoá dấu vết. Chỉ cấp INSERT/SELECT.",
      "Xoá dữ liệu người dùng trong DB chính nhưng quên bản sao ở log, cache, search index, dịch vụ phân tích. Lập bản đồ dữ liệu trước."
    ],
    quiz: [
      {
        q: "Tính chất quan trọng nhất của audit log là gì?",
        options: [
          "Lưu trong RAM để ghi thật nhanh",
          "Chứa cả mật khẩu để tiện điều tra",
          "Chỉ ghi thêm, không ai sửa hay xoá được",
          "Tự xoá sau 1 ngày để tiết kiệm dung lượng"
        ],
        answer: 2,
        explain: "Audit log chỉ có giá trị khi đáng tin; nếu kẻ tấn công sửa được thì không còn là bằng chứng. Không bao giờ chứa mật khẩu."
      },
      {
        q: "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 có hiệu lực từ khi nào?",
        options: ["01/07/2025", "01/01/2026", "01/07/2026", "01/01/2027"],
        answer: 1,
        explain: "Luật có hiệu lực từ ngày 01/01/2026."
      },
      {
        q: "Cách tốt nhất để tránh PII lọt vào log là gì?",
        options: [
          "Redact tự động ở logger, chỉ log userId",
          "Nhắc dev cẩn thận trong mỗi lần review",
          "Tắt toàn bộ log trên môi trường production",
          "Base64 các trường cá nhân trước khi log"
        ],
        answer: 0,
        explain: "Biện pháp tự động ở một chỗ đáng tin hơn trông chờ con người. Tắt log làm mất khả năng điều tra; base64 không che giấu gì."
      }
    ]
  },

  "p05.m0.t7": {
    videos: [
      { id: "xYfiOnufBSk", title: "How Passkeys Work - Computerphile", channel: "Computerphile", lang: "en", minutes: 19, embed: true },
      { id: "rsJcXHUZhRY", title: "A Developer's Guide to WebAuthN", channel: "OktaDev", lang: "en", minutes: 9, embed: true }
    ],
    sections: [
      {
        h: "Passkey là gì và vì sao chống được phishing?",
        p: [
          "Mật khẩu có hai điểm yếu cố hữu: người dùng dùng lại mật khẩu ở nhiều nơi, và họ có thể bị lừa gõ mật khẩu vào trang giả. Ngay cả OTP qua SMS hay ứng dụng cũng bị trang phishing chuyển tiếp theo thời gian thực. Passkey là cách đăng nhập không mật khẩu do FIDO Alliance cùng W3C chuẩn hoá qua đặc tả WebAuthn.",
          "Cơ chế cốt lõi là mật mã khoá công khai. Khi đăng ký, thiết bị của người dùng (điện thoại, laptop, khoá bảo mật) tạo một cặp khoá riêng cho website đó. Server chỉ lưu khoá công khai; khoá bí mật không bao giờ rời thiết bị hoặc trình quản lý passkey. Khi đăng nhập, server gửi một challenge ngẫu nhiên, thiết bị ký challenge sau khi người dùng mở khoá bằng vân tay, khuôn mặt hoặc PIN.",
          "Phần chống phishing nằm ở chỗ credential gắn với một RP ID, tức tên miền của relying party (website của bạn). Trình duyệt tự đưa origin thật vào dữ liệu được ký (`clientDataJSON`), nên trang giả `examp1e.com` không thể dùng passkey của `example.com`. Nếu database bị lộ, kẻ tấn công cũng không có gì để đăng nhập vì khoá công khai không thay được khoá bí mật."
        ]
      },
      {
        h: "Hai nghi thức: đăng ký và xác thực",
        list: [
          "Đăng ký (registration): server tạo options gồm challenge, thông tin RP (`rpID`, `rpName`) và user; trình duyệt gọi `navigator.credentials.create()`; server kiểm tra challenge, origin, RP ID rồi lưu credential ID, khoá công khai, counter, transports.",
          "Xác thực (authentication): server tạo challenge mới; trình duyệt gọi `navigator.credentials.get()`; server tìm credential theo ID, kiểm tra chữ ký bằng khoá công khai đã lưu.",
          "Challenge phải ngẫu nhiên, chỉ dùng một lần và có hạn ngắn; lưu phía server (session hoặc Redis) chứ không tin giá trị client gửi lên.",
          "Discoverable credential (passkey thực thụ) cho phép đăng nhập mà không cần gõ username: người dùng chọn tài khoản ngay trong hộp thoại của hệ điều hành."
        ],
        p: [
          "Tự phân tích CBOR, COSE key và kiểm tra chữ ký rất dễ sai, vì vậy hãy dùng thư viện đã được kiểm chứng như SimpleWebAuthn (`@simplewebauthn/server` ở backend, `@simplewebauthn/browser` ở frontend)."
        ]
      },
      {
        h: "Triển khai với SimpleWebAuthn trong NestJS",
        p: [
          "Ví dụ dưới đây là phần service phía server. Frontend gọi `startRegistration({ optionsJSON })` hoặc `startAuthentication({ optionsJSON })` của `@simplewebauthn/browser` rồi POST kết quả về. Trường `counter` có thể luôn bằng 0 với passkey được đồng bộ qua cloud, nên đừng coi counter không tăng là tấn công trong trường hợp đó."
        ],
        code: {
          lang: "typescript",
          file: "passkey.service.ts",
          src: `import {
  generateRegistrationOptions, verifyRegistrationResponse,
  generateAuthenticationOptions, verifyAuthenticationResponse,
} from '@simplewebauthn/server';

const rpID = 'example.com';
const origin = 'https://example.com';

export async function startRegister(user: { id: string; email: string }) {
  const existing = await db.passkey.findMany({ where: { userId: user.id } });
  const options = await generateRegistrationOptions({
    rpName: 'DevPath Shop',
    rpID,
    userName: user.email,
    attestationType: 'none',
    excludeCredentials: existing.map((c) => ({ id: c.id, transports: c.transports })),
    authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' },
  });
  await redis.set(\`webauthn:reg:\${user.id}\`, options.challenge, 'EX', 300);
  return options; // gửi cho frontend
}

export async function finishRegister(userId: string, body: any) {
  const expectedChallenge = await redis.getdel(\`webauthn:reg:\${userId}\`);
  if (!expectedChallenge) throw new Error('Challenge hết hạn');
  const { verified, registrationInfo } = await verifyRegistrationResponse({
    response: body, expectedChallenge, expectedOrigin: origin, expectedRPID: rpID,
  });
  if (!verified || !registrationInfo) throw new Error('Đăng ký thất bại');
  const { credential } = registrationInfo;
  await db.passkey.create({ data: {
    id: credential.id, userId, publicKey: Buffer.from(credential.publicKey),
    counter: credential.counter, transports: credential.transports ?? [],
  } });
}

export async function finishLogin(sessionId: string, body: any) {
  const expectedChallenge = await redis.getdel(\`webauthn:auth:\${sessionId}\`);
  const passkey = await db.passkey.findUnique({ where: { id: body.id } });
  if (!expectedChallenge || !passkey) throw new Error('Không hợp lệ');
  const { verified, authenticationInfo } = await verifyAuthenticationResponse({
    response: body, expectedChallenge, expectedOrigin: origin, expectedRPID: rpID,
    credential: { id: passkey.id, publicKey: new Uint8Array(passkey.publicKey),
                  counter: passkey.counter, transports: passkey.transports },
  });
  if (!verified) throw new Error('Sai chữ ký');
  await db.passkey.update({ where: { id: passkey.id },
    data: { counter: authenticationInfo.newCounter } });
  return passkey.userId; // tạo session như bình thường
}
// startLogin: generateAuthenticationOptions({ rpID }) rồi lưu challenge tương tự`
        }
      }
    ],
    summary: [
      "Passkey dùng cặp khoá công khai/bí mật; server chỉ lưu khoá công khai nên lộ DB không lộ thông tin đăng nhập.",
      "Credential gắn với RP ID và trình duyệt ký kèm origin thật, nên trang phishing không dùng được passkey.",
      "Hai nghi thức: đăng ký (`credentials.create`) và xác thực (`credentials.get`), đều dựa trên challenge ngẫu nhiên, dùng một lần.",
      "Dùng thư viện đã kiểm chứng như SimpleWebAuthn thay vì tự kiểm tra CBOR/chữ ký.",
      "Cho phép một tài khoản có nhiều passkey và giữ phương án khôi phục tài khoản an toàn."
    ],
    pitfalls: [
      "Đặt `rpID` sai (ví dụ có cổng hoặc `https://`) hoặc đổi tên miền sau khi triển khai, mọi passkey đã đăng ký thành vô dụng. RP ID là tên miền thuần, chọn cẩn thận ngay từ đầu.",
      "Lưu challenge ở client hoặc cho dùng lại nhiều lần, mở đường cho tấn công replay. Lưu phía server, đặt TTL ngắn và xoá ngay sau khi kiểm tra.",
      "Làm passkey rất chắc nhưng luồng khôi phục tài khoản chỉ cần email yếu hoặc SMS, kẻ tấn công sẽ đi đường vòng đó. Bảo vệ luồng khôi phục tương xứng."
    ],
    quiz: [
      {
        q: "Điều gì giúp passkey chống được trang phishing giả mạo tên miền?",
        options: [
          "Server lưu khoá bí mật và so sánh với khoá người dùng gửi lên",
          "Người dùng phải nhập thêm mã OTP gửi qua SMS mỗi lần đăng nhập",
          "Trình duyệt mã hoá mật khẩu trước khi gửi nó lên cho server",
          "Credential gắn với RP ID và trình duyệt ký kèm origin thật"
        ],
        answer: 3,
        explain: "Trình duyệt chỉ cho dùng credential với đúng RP ID và đưa origin vào `clientDataJSON` được ký, nên trang giả không nhận được chữ ký hợp lệ. Server chỉ lưu khoá công khai; passkey không dùng OTP hay mật khẩu."
      },
      {
        q: "Khi đăng ký passkey thành công, server cần lưu những gì?",
        options: [
          "Credential ID, khoá công khai, counter và transports",
          "Khoá bí mật, credential ID và vân tay của người dùng",
          "Challenge, khoá bí mật và tên thiết bị của người dùng",
          "Mật khẩu đã băm, challenge và mã PIN của thiết bị"
        ],
        answer: 0,
        explain: "Khoá bí mật và dữ liệu sinh trắc học không bao giờ rời thiết bị. Server lưu credential ID để tra cứu, khoá công khai để kiểm tra chữ ký, counter và transports; challenge chỉ tồn tại tạm thời."
      },
      {
        q: "Vì sao challenge phải được sinh và lưu ở server, dùng một lần?",
        options: [
          "Để trình duyệt có thể tạo cặp khoá mới nhanh hơn",
          "Để chữ ký cũ bị bắt được không thể gửi lại lần nữa",
          "Để server có thể giải mã khoá bí mật của thiết bị",
          "Để thiết bị có thể bỏ qua bước xác minh người dùng"
        ],
        answer: 1,
        explain: "Mỗi lần xác thực ký trên một challenge mới, nên chữ ký cũ không khớp với challenge hiện tại và bị từ chối, chống replay. Challenge không liên quan tới tốc độ tạo khoá hay bước xác minh người dùng, và server không bao giờ có khoá bí mật."
      }
    ]
  },

  "p05.m2.t8": {
    videos: [
      { id: "rPdn88pO7x0", title: "How File Upload Vulnerabilities Work!", channel: "Intigriti", lang: "en", minutes: 7, embed: true },
      { id: "I2ZYUulreI4", title: "Implementing Signature Verification for Webhooks (GitHub HMAC verification)", channel: "Hookdeck", lang: "en", minutes: 11, embed: true }
    ],
    sections: [
      {
        h: "Upload file: mọi thứ từ client đều có thể giả",
        p: [
          "Chức năng upload avatar hay hoá đơn trông đơn giản nhưng là cửa ngõ tấn công quen thuộc: kẻ xấu tải lên file `.php` hay `.html` rồi truy cập để chạy mã, gửi file vài GB làm đầy đĩa, dùng tên file như `../../etc/passwd` để ghi đè, hoặc tải SVG chứa JavaScript để XSS người xem. Header `Content-Type` và phần đuôi tên file đều do client gửi nên có thể giả tuỳ ý.",
          "OWASP File Upload Cheat Sheet đưa ra các nguyên tắc chính:"
        ],
        list: [
          "Giới hạn kích thước ngay ở tầng nhận request (multer, reverse proxy), không đợi nhận xong mới kiểm tra.",
          "Dùng allowlist đuôi file cần cho nghiệp vụ, không dùng blocklist; kiểm tra thêm chữ ký file (magic bytes) thay vì tin `Content-Type`.",
          "Tự sinh tên file (UUID), không dùng tên người dùng gửi lên làm đường dẫn.",
          "Lưu ngoài web root, tốt nhất là object storage (S3, R2, MinIO) hoặc domain riêng; trả file với `Content-Disposition: attachment` nếu không cần hiển thị.",
          "Với file từ người lạ, cân nhắc quét malware hoặc xử lý lại (re-encode ảnh) để loại nội dung nhúng."
        ]
      },
      {
        h: "Ví dụ trong NestJS",
        p: [
          "Đoạn code giới hạn 5 MB bằng tuỳ chọn `limits` của multer, kiểm tra magic bytes của PNG/JPEG, sinh tên ngẫu nhiên rồi đẩy lên S3. Với file lớn, cách tốt hơn là cấp presigned URL để client upload thẳng lên S3, nhưng vẫn phải giới hạn kích thước và kiểm tra lại file sau khi upload."
        ],
        code: {
          lang: "typescript",
          file: "avatar.controller.ts",
          src: `import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';

const SIGNATURES: Record<string, number[]> = {
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  jpg: [0xff, 0xd8, 0xff],
};

function detectType(buf: Buffer): string | null {
  for (const [ext, sig] of Object.entries(SIGNATURES)) {
    if (sig.every((b, i) => buf[i] === b)) return ext;
  }
  return null;
}

@Controller('avatars')
export class AvatarController {
  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024, files: 1 } }))
  async upload(@UploadedFile() file: Express.Multer.File) {
    const ext = file && detectType(file.buffer);
    if (!ext) throw new BadRequestException('Chỉ chấp nhận ảnh PNG hoặc JPEG');
    const key = \`avatars/\${randomUUID()}.\${ext}\`;   // không dùng file.originalname
    await s3.putObject({ Bucket: 'user-uploads', Key: key, Body: file.buffer,
      ContentType: ext === 'png' ? 'image/png' : 'image/jpeg' });
    return { key };
  }
}`
        }
      },
      {
        h: "Webhook: ký bằng HMAC và chống replay",
        p: [
          "Webhook là URL công khai để dịch vụ khác (Stripe, GitHub, cổng thanh toán) gọi vào báo sự kiện như \"đơn đã thanh toán\". Nếu không xác minh, bất kỳ ai cũng có thể POST một sự kiện giả. Cách chuẩn là HMAC-SHA256: hai bên chia sẻ một secret, bên gửi tính chữ ký trên body và gửi kèm header; bên nhận tính lại và so sánh. GitHub gửi `X-Hub-Signature-256: sha256=<hex>`; Stripe gửi `Stripe-Signature: t=<timestamp>,v1=<hex>` và ký chuỗi `timestamp + \".\" + body`.",
          "Ba chi tiết hay sai: phải ký trên raw body đúng từng byte (trong NestJS bật `rawBody: true` ở `NestFactory.create` và đọc `req.rawBody`), vì parse JSON rồi stringify lại sẽ ra chuỗi khác; so sánh bằng `crypto.timingSafeEqual` thay vì `===` để không lộ thông tin qua thời gian phản hồi (hàm này ném lỗi nếu hai buffer khác độ dài, nên kiểm tra độ dài trước); và từ chối timestamp quá cũ (thư viện Stripe mặc định cho phép lệch 5 phút) để kẻ bắt được request không gửi lại được. Cuối cùng, lưu event ID đã xử lý vì bên gửi có thể gửi lại cùng một sự kiện."
        ],
        code: {
          lang: "typescript",
          file: "verify-webhook.ts",
          src: `import { createHmac, timingSafeEqual } from 'node:crypto';

const TOLERANCE_SEC = 300;

export function verifyWebhook(rawBody: Buffer, header: string, secret: string): boolean {
  // header dạng: t=1758873600,v1=5257a8...
  // (Stripe có thể gửi nhiều v1 khi đang xoay secret; bản rút gọn này chỉ lấy một)
  const parts = Object.fromEntries(header.split(',').map((kv) => kv.split('=', 2)));
  const t = Number(parts.t);
  if (!t || !parts.v1) return false;
  if (Math.abs(Date.now() / 1000 - t) > TOLERANCE_SEC) return false; // chống replay

  const expected = createHmac('sha256', secret)
    .update(\`\${t}.\`)
    .update(rawBody)
    .digest();
  const received = Buffer.from(parts.v1, 'hex');
  return received.length === expected.length && timingSafeEqual(received, expected);
}`
        }
      }
    ],
    summary: [
      "Không tin `Content-Type` hay tên file từ client; dùng allowlist, kiểm tra magic bytes và tự sinh tên file.",
      "Giới hạn kích thước ngay khi nhận và lưu file ngoài web root, tốt nhất ở object storage.",
      "Xác minh webhook bằng HMAC-SHA256 trên raw body với secret dùng chung.",
      "So sánh chữ ký bằng `crypto.timingSafeEqual` và kiểm tra độ dài trước.",
      "Chống replay bằng timestamp nằm trong phần được ký, cộng với lưu event ID để xử lý idempotent."
    ],
    pitfalls: [
      "Lưu file upload vào thư mục `public/` do web server phục vụ trực tiếp, file `.html` hay `.svg` độc hại chạy ngay trên domain của bạn. Lưu ở bucket riêng và phục vụ qua domain tách biệt.",
      "Tính HMAC trên `JSON.stringify(req.body)` thay vì raw body, chữ ký lúc đúng lúc sai tuỳ khoảng trắng và thứ tự khoá. Luôn dùng buffer gốc.",
      "Xác minh chữ ký đúng nhưng không kiểm tra timestamp hay event ID, kẻ tấn công gửi lại một webhook \"đã thanh toán\" cũ nhiều lần. Kiểm tra độ mới và lưu ID đã xử lý."
    ],
    quiz: [
      {
        q: "Cách nào đáng tin nhất để biết file upload thực sự là ảnh PNG?",
        options: [
          "Kiểm tra header `Content-Type` là `image/png`",
          "Kiểm tra tên file kết thúc bằng đuôi `.png`",
          "Kiểm tra magic bytes ở đầu nội dung file",
          "Kiểm tra dung lượng file nhỏ hơn 5 MB"
        ],
        answer: 2,
        explain: "Content-Type và tên file đều do client gửi nên giả được dễ dàng. Magic bytes nằm trong nội dung file, đáng tin hơn (dù vẫn nên kết hợp allowlist và re-encode). Giới hạn dung lượng chống DoS chứ không xác định loại file."
      },
      {
        q: "Vì sao nên dùng `crypto.timingSafeEqual` khi so sánh chữ ký webhook?",
        options: [
          "Vì nó tự tính lại HMAC từ raw body của request",
          "Vì nó tự từ chối các request có timestamp quá cũ",
          "Vì nó so sánh nhanh hơn `===` với chuỗi hex dài",
          "Vì thời gian so sánh không lộ vị trí byte sai đầu tiên"
        ],
        answer: 3,
        explain: "So sánh thường dừng ở byte khác đầu tiên, kẻ tấn công có thể đo thời gian để đoán dần chữ ký. timingSafeEqual chạy thời gian hằng; nó không tính HMAC, không kiểm tra timestamp và không nhằm mục đích nhanh hơn."
      },
      {
        q: "Timestamp trong header chữ ký webhook giúp chống kiểu tấn công nào?",
        options: [
          "Kẻ tấn công gửi lại một request hợp lệ đã bắt được",
          "Kẻ tấn công sửa body nhưng vẫn giữ nguyên chữ ký cũ",
          "Kẻ tấn công đoán secret bằng cách thử rất nhiều lần",
          "Kẻ tấn công tải lên file lớn làm đầy ổ đĩa của server"
        ],
        answer: 0,
        explain: "Timestamp nằm trong chuỗi được ký nên không sửa được; server từ chối request quá cũ, chặn replay. Sửa body đã bị chính HMAC phát hiện; đoán secret và upload file lớn cần biện pháp khác."
      }
    ]
  },

});
