// @ts-check
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const ROUTES = ['#/', '#/roadmap', '#/phase/p00', '#/phase/p08', '#/phase/p13', '#/learn/p03/2/4', '#/learn/p07/1/0', '#/learn/p13/1/6', '#/labs', '#/lab/lab03', '#/lab/lab06', '#/projects', '#/career', '#/progress'];

// Thu lỗi JS (bỏ qua lỗi tải tài nguyên CDN khi chạy offline)
function trackErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/Failed to load resource|net::ERR/i.test(m.text())) errors.push(m.text());
  });
  return errors;
}

async function openMenuIfMobile(page, isMobile) {
  if (isMobile) {
    await page.locator('#menuBtn').click();
    await expect(page.locator('#rail')).toHaveClass(/open/);
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test.describe('Trang chủ', () => {
  test('banner, lưới khóa học theo nhóm và labs', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/#/');
    await expect(page.locator('.banner h1')).toHaveText('Lộ trình Backend & Fullstack Engineer');
    await expect(page.locator('.banner p')).toContainText('14 khóa học');
    await expect(page.locator('.banner p')).toContainText('322 bài học');
    await expect(page.locator('.course-card')).toHaveCount(14);
    await expect(page.locator('.track')).toHaveCount(5);
    await expect(page.locator('.track').nth(2).locator('.course-card')).toHaveCount(5);
    await expect(page.locator('.track').last().locator('.lab-card')).toHaveCount(4);
    await expect(page.locator('.continue')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('thẻ khóa học mở trang chương', async ({ page }) => {
    await page.goto('/#/');
    await page.locator('.course-card[data-course="p10"]').click();
    await expect(page).toHaveURL(/#\/phase\/p10$/);
    await expect(page.locator('h1')).toHaveText('Kubernetes & Orchestration');
  });

  test('Bắt đầu học mở bài đầu tiên, sau đó hiện thẻ Học tiếp', async ({ page }) => {
    await page.goto('/#/');
    const cta = page.locator('.banner [data-continue]');
    await expect(cta).toHaveText('Bắt đầu học miễn phí');
    await cta.click();
    await expect(page).toHaveURL(/#\/learn\/p00\/0\/0$/);
    await page.locator('[data-act="complete"]').click();
    await expect(page).toHaveURL(/#\/learn\/p00\/0\/1$/);
    await page.goto('/#/');
    await expect(page.locator('.continue h2')).toHaveText('Process vs Thread');
    await expect(page.locator('.banner .btn-white').first()).toHaveText('Học tiếp');
    await expect(page.locator('.course-card[data-course="p00"] .cc-progress')).toBeVisible();
    await page.locator('.continue [data-continue]').click();
    await expect(page).toHaveURL(/#\/learn\/p00\/0\/1$/);
  });
});

test.describe('Trang chương', () => {
  test('bố cục trang khóa học: học được gì, nội dung, thẻ đăng ký', async ({ page }) => {
    await page.goto('/#/phase/p08');
    await expect(page.locator('h1')).toHaveText('CI/CD chuyên sâu & DevSecOps');
    await expect(page.locator('.learn-list li')).toHaveCount(3 + 6);
    await expect(page.locator('.curr-meta')).toContainText('6 phần');
    await expect(page.locator('.curr-meta')).toContainText('41 bài học');
    await expect(page.locator('details.module')).toHaveCount(6);
    await expect(page.locator('details.module[open]')).toHaveCount(1);
    await expect(page.locator('.enroll [data-start]')).toHaveText('Bắt đầu học');
    await expect(page.locator('.enroll-list')).toContainText('Tổng số 41 bài học');
    await expect(page.locator('.requirements')).toContainText('Chương 07');
  });

  test('mở/thu gọn tất cả phần', async ({ page }) => {
    await page.goto('/#/phase/p08');
    await page.locator('[data-act="expand"]').click();
    await expect(page.locator('details.module[open]')).toHaveCount(6);
    await page.locator('[data-act="collapse"]').click();
    await expect(page.locator('details.module[open]')).toHaveCount(0);
  });

  test('link tới một phần mở và cuộn tới phần đó', async ({ page }) => {
    await page.goto('/#/phase/p08?m=4');
    const mod = page.locator('#m4');
    await expect(mod).toHaveAttribute('open', '');
    await expect(mod.locator('.mod-title')).toHaveText('5. DevSecOps: bảo mật trong pipeline');
    await expect(mod).toBeInViewport();
  });

  test('click bài học mở trang học', async ({ page }) => {
    await page.goto('/#/phase/p04');
    await page.locator('[data-act="expand"]').click();
    await page.locator('#m2 .lesson-link').nth(1).click();
    await expect(page).toHaveURL(/#\/learn\/p04\/2\/1$/);
    await expect(page.locator('.lesson-wrap h1')).toHaveText('Isolation levels');
  });

  test('pager chuyển chương trước/sau', async ({ page }) => {
    await page.goto('/#/phase/p00');
    await expect(page.locator('.pager-prev')).toHaveCount(0);
    await page.locator('.pager-next').click();
    await expect(page).toHaveURL(/#\/phase\/p01$/);
    await page.goto('/#/phase/p13');
    await expect(page.locator('.pager-next')).toContainText('Capstone');
  });
});

test.describe('Trang học (player)', () => {
  test('bố cục player: thanh trên, nội dung, danh sách bài, thanh dưới', async ({ page, isMobile }) => {
    await page.goto('/#/learn/p08/1/6');
    await expect(page.locator('.header')).toBeHidden();
    await expect(page.locator('.player-top .pt-title')).toHaveText('CI/CD chuyên sâu & DevSecOps');
    await expect(page.locator('.lesson-wrap h1')).toHaveText('OIDC tới cloud');
    await expect(page).toHaveTitle(/OIDC tới cloud/);
    await expect(page.locator('.lesson-meta')).toContainText('GitHub Actions chuyên sâu');
    await expect(page.locator('.player-bar')).toBeInViewport();
    await expect(page.locator('.ps-lesson')).toHaveCount(41);
    if (isMobile) {
      await expect(page.locator('#player')).not.toHaveClass(/side-open/);
      await page.locator('.pb-side').click();
    }
    await expect(page.locator('#player')).toHaveClass(/side-open/);
    await expect(page.locator('.ps-lesson.active')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('.ps-lesson.active')).toBeInViewport();
  });

  test('đóng/mở danh sách bài học', async ({ page }) => {
    await page.goto('/#/learn/p08/1/6');
    const before = await page.locator('#player').getAttribute('class');
    await page.locator('.pb-side').click();
    const after = await page.locator('#player').getAttribute('class');
    expect(/side-open/.test(before || '')).not.toBe(/side-open/.test(after || ''));
  });

  test('hoàn thành bài chuyển sang bài tiếp và lưu trạng thái', async ({ page }) => {
    await page.goto('/#/learn/p08/1/6');
    await page.locator('[data-act="complete"]').click();
    await expect(page).toHaveURL(/#\/learn\/p08\/1\/7$/);
    await expect(page.locator('#toast')).toContainText('Đã hoàn thành bài học');
    await expect(page.locator('.pt-progress strong')).toHaveText('1/41');
    await page.locator('[data-prev]').click();
    await expect(page.locator('[data-act="complete"]')).toHaveText('Đã hoàn thành');
    await expect(page.locator('[data-act="complete"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.ps-lesson.active .lesson-state')).toHaveClass(/done/);
    await page.reload();
    await expect(page.locator('[data-act="complete"]')).toHaveText('Đã hoàn thành');
    await page.locator('[data-act="complete"]').click();
    await expect(page.locator('[data-act="complete"]')).toHaveText('Hoàn thành & học tiếp');
  });

  test('phím mũi tên chuyển bài', async ({ page }) => {
    await page.goto('/#/learn/p03/2/2');
    await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL(/#\/learn\/p03\/2\/3$/);
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(page).toHaveURL(/#\/learn\/p03\/2\/1$/);
  });

  test('bài cuối chương dẫn sang dự án của chương', async ({ page }) => {
    await page.goto('/#/learn/p00/3/6');
    await expect(page.locator('[data-next-link]')).toHaveAttribute('aria-label', 'Sang dự án của chương');
    await page.locator('[data-next-link]').click();
    await expect(page).toHaveURL(/#\/phase\/p00\?s=project$/);
    await expect(page.locator('#project')).toBeInViewport();
  });

  test('bài đầu tiên không có nút Bài trước', async ({ page }) => {
    await page.goto('/#/learn/p00/0/0');
    await expect(page.locator('[data-prev]')).toHaveCount(0);
    await expect(page.locator('.pb-btn.is-disabled')).toBeVisible();
  });

  test('nạp nội dung chi tiết, code có nút sao chép', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/#/learn/p07/1/0');
    await expect(page.locator('.lc-section').first()).toBeVisible();
    expect(await page.locator('.lc-section').count()).toBeGreaterThanOrEqual(2);
    await expect(page.locator('.lc-summary li').first()).toBeVisible();
    await expect(page.locator('.lc-pitfalls li').first()).toBeVisible();
    const copy = page.locator('.lesson-content .copy').first();
    await copy.click();
    await expect(copy).toHaveText('Đã chép');
    expect((await page.evaluate(() => navigator.clipboard.readText())).length).toBeGreaterThan(10);
  });

  test('quiz: chọn đáp án, hiện giải thích, lưu và làm lại', async ({ page }) => {
    await page.goto('/#/learn/p07/1/0');
    const q = page.locator('.quiz-q').first();
    await expect(q).toBeVisible();
    const answer = Number(await q.getAttribute('data-answer'));
    await q.locator(`.quiz-opt[data-opt="${answer}"]`).click();
    await expect(q).toHaveClass(/is-right/);
    await expect(q.locator('.quiz-explain')).toBeVisible();
    await expect(q.locator('.quiz-explain strong')).toHaveText('Chính xác.');
    await expect(q.locator('.quiz-opt').first()).toBeDisabled();

    const q2 = page.locator('.quiz-q').nth(1);
    const a2 = Number(await q2.getAttribute('data-answer'));
    await q2.locator(`.quiz-opt[data-opt="${(a2 + 1) % 4}"]`).click();
    await expect(q2).toHaveClass(/is-wrong/);
    await expect(q2.locator('.quiz-opt.correct')).toHaveAttribute('data-opt', String(a2));

    await page.reload();
    await expect(page.locator('.quiz-q').first()).toHaveClass(/is-right/);
    await page.locator('[data-act="quiz-reset"]').click();
    await expect(page.locator('.quiz-q.is-right, .quiz-q.is-wrong')).toHaveCount(0);
  });

  test('bài không tồn tại hiển thị 404', async ({ page }) => {
    await page.goto('/#/learn/p05/9/9');
    await expect(page.locator('h1')).toHaveText('Không tìm thấy trang');
  });
});

test.describe('Điều hướng', () => {
  test('menu dọc hoạt động', async ({ page, isMobile }) => {
    await page.goto('/#/');
    for (const [name, h1] of [['Lộ trình', 'Lộ trình học'], ['Labs', 'Labs thực hành'], ['Dự án', '12 bậc dự án'], ['Sự nghiệp', 'Từ học viên'], ['Tiến độ', 'Bạn đã đi được'], ['Trang chủ', 'Lộ trình Backend']]) {
      await openMenuIfMobile(page, isMobile);
      await page.locator('#rail a', { hasText: name }).click();
      await expect(page.locator('main h1').first()).toContainText(h1);
      await expect(page.locator('#rail a.active')).toHaveText(name);
    }
  });

  test('menu mobile mở/đóng bằng scrim và Esc', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Chỉ dành cho mobile');
    await page.goto('/#/');
    await page.locator('#menuBtn').click();
    await expect(page.locator('#rail')).toHaveClass(/open/);
    await expect(page.locator('#menuBtn')).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(page.locator('#rail')).not.toHaveClass(/open/);
    await page.locator('#menuBtn').click();
    await page.locator('#scrim').click({ position: { x: 380, y: 300 } });
    await expect(page.locator('#rail')).not.toHaveClass(/open/);
  });

  test('lộ trình liệt kê 14 khóa học theo thứ tự', async ({ page }) => {
    await page.goto('/#/roadmap');
    await expect(page.locator('.rm-item')).toHaveCount(14);
    await expect(page.locator('.rm-item').first().locator('.rm-meta')).toContainText('Tuần 1–4');
    await page.locator('.rm-card').nth(5).click();
    await expect(page).toHaveURL(/#\/phase\/p05$/);
  });

  test('route không tồn tại hiển thị 404', async ({ page }) => {
    for (const r of ['#/khong-co', '#/phase/p99', '#/lab/lab99']) {
      await page.goto('/' + r);
      await expect(page.locator('h1')).toHaveText('Không tìm thấy trang');
    }
  });
});

test.describe('Tiến độ', () => {
  test('tick bài học trong trang chương cập nhật % và lưu sau khi reload', async ({ page }) => {
    await page.goto('/#/phase/p06');
    await expect(page.locator('.enroll [data-phasecount="p06"]')).toHaveText('0/19'); // 13 bài + 3 tiêu chí dự án + 3 checkpoint
    await page.locator('#m1 > summary').click();
    const boxes = page.locator('#m1 .topic');
    await boxes.nth(0).click();
    await boxes.nth(1).click();
    await expect(page.locator('[data-modcount="p06.m1"]')).toHaveText('2/5');
    await expect(page.locator('.enroll [data-phasecount="p06"]')).toHaveText('2/19');
    await expect(page.locator('.enroll .cp-num')).toHaveText('11%');
    await page.reload();
    await page.locator('#m1 > summary').click();
    await expect(page.locator('#m1 .topic input').nth(0)).toBeChecked();
    await expect(page.locator('.enroll [data-start]')).toContainText('Học tiếp');
  });

  test('checkbox dùng được bằng bàn phím', async ({ page }) => {
    await page.goto('/#/phase/p00');
    const input = page.locator('.topic input').first();
    await input.focus();
    await page.keyboard.press('Space');
    await expect(input).toBeChecked();
  });

  test('chương hoàn thành hiển thị dấu tick trên lộ trình', async ({ page }) => {
    await page.evaluate(() => {
      const p = window.PHASES[13]; const prog = {};
      p.modules.forEach((m, mi) => m.topics.forEach((_, ti) => { prog[`p13.m${mi}.t${ti}`] = 1; }));
      p.project.reqs.forEach((_, i) => { prog[`p13.proj.r${i}`] = 1; });
      p.checkpoint.forEach((_, i) => { prog[`p13.cp.${i}`] = 1; });
      localStorage.setItem('devpath-progress-v1', JSON.stringify(prog));
    });
    await page.goto('/#/roadmap');
    await page.reload();
    await expect(page.locator('.rm-step').nth(13)).toHaveClass(/done/);
    await expect(page.locator('.rm-step.done')).toHaveCount(1);
  });

  test('hoàn thành lab hiển thị toast và cập nhật trang Labs', async ({ page }) => {
    await page.goto('/#/lab/lab01');
    await page.locator('.lab-done .check').click();
    await expect(page.locator('#toast')).toContainText('hoàn thành lab');
    await page.goto('/#/labs');
    await expect(page.locator('.lab-card.is-done')).toHaveCount(1);
    await expect(page.locator('.page-head .lead strong')).toHaveText('1/11');
  });

  test('xuất, nhập và xoá tiến độ', async ({ page }) => {
    await page.goto('/#/phase/p00');
    await page.locator('.topic').nth(0).click();
    await page.locator('.topic').nth(1).click();
    await page.goto('/#/progress');

    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('[data-act="export"]').click()]);
    expect(download.suggestedFilename()).toBe('devpath-progress.json');
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
    expect(data.app).toBe('devpath');
    expect(Object.keys(data.progress)).toEqual(expect.arrayContaining(['p00.m0.t0', 'p00.m0.t1']));

    page.once('dialog', (d) => d.accept());
    await page.locator('[data-act="reset"]').click();
    await expect(page.locator('#toast')).toContainText('Đã xoá');
    expect(await page.evaluate(() => localStorage.getItem('devpath-progress-v1'))).toBe('{}');

    await page.locator('[data-act="import"]').setInputFiles({ name: 'p.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) });
    await expect(page.locator('#toast')).toContainText('Đã nhập');
    await expect(page.locator('.progress-row').first().locator('.pr-count')).toHaveText('2/34');

    await page.locator('[data-act="import"]').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('not json') });
    await expect(page.locator('#toast')).toContainText('không hợp lệ');
  });

  test('huỷ hộp thoại xoá thì giữ nguyên tiến độ', async ({ page }) => {
    await page.goto('/#/phase/p00');
    await page.locator('.topic').nth(0).click();
    await page.goto('/#/progress');
    page.once('dialog', (d) => d.dismiss());
    await page.locator('[data-act="reset"]').click();
    await expect(page.locator('.progress-row').first().locator('.pr-count')).toHaveText('1/34');
  });

  test('vẫn chạy khi localStorage bị chặn', async ({ page }) => {
    const errors = trackErrors(page);
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
    });
    await page.goto('/#/phase/p00');
    await page.locator('.topic').first().click();
    await expect(page.locator('.topic input').first()).toBeChecked();
    expect(errors).toEqual([]);
  });
});

test.describe('Tìm kiếm', () => {
  test('Ctrl+K mở palette, tìm "canary" và Enter mở bài học', async ({ page }) => {
    await page.goto('/#/');
    await page.keyboard.press('Control+k');
    await expect(page.locator('#palette')).toBeVisible();
    await expect(page.locator('#paletteInput')).toBeFocused();
    await page.locator('#paletteInput').fill('canary');
    await expect(page.locator('#paletteResults li[role="option"]').first()).toContainText('Canary');
    await page.keyboard.press('Enter');
    await expect(page.locator('#palette')).toBeHidden();
    await expect(page).toHaveURL(/#\/learn\/p08\/3\/2$/);
  });

  test('tìm không dấu vẫn khớp tiếng Việt', async ({ page }) => {
    await page.goto('/#/');
    await page.locator('#searchBtn').click();
    await page.locator('#paletteInput').fill('bao mat');
    await expect(page.locator('#paletteResults li[role="option"]').first()).toBeVisible();
    await expect(page.locator('#paletteResults')).toContainText('Bảo mật');
  });

  test('phím mũi tên chọn kết quả và click lab', async ({ page }) => {
    await page.goto('/#/');
    await page.locator('#searchBtn').click();
    await page.locator('#paletteInput').fill('terraform');
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#opt1')).toHaveAttribute('aria-selected', 'true');
    await page.locator('#paletteResults a', { hasText: 'Terraform: VPC + ECS Fargate + RDS' }).click();
    await expect(page).toHaveURL(/#\/lab\/lab05$/);
  });

  test('tìm được từ trang học và Esc đóng palette', async ({ page }) => {
    await page.goto('/#/learn/p00/0/0');
    await page.keyboard.press('Control+k');
    await page.locator('#paletteInput').fill('zzzqqq');
    await expect(page.locator('#paletteResults .empty')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#palette')).toBeHidden();
  });
});

test.describe('Labs', () => {
  test('trang Labs có 11 lab', async ({ page }) => {
    await page.goto('/#/labs');
    await expect(page.locator('.lab-card')).toHaveCount(11);
  });

  test('lab GitHub Actions giữ nguyên cú pháp ${{ }} và copy được code', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/#/lab/lab03');
    await expect(page.locator('h1')).toContainText('GitHub Actions CI');
    const code = page.locator('.code pre code').first();
    await expect(code).toContainText('group: ci-${{ github.ref }}');
    await expect(code).toContainText('aquasecurity/trivy-action@ed142fd0673e97e23eac54620cfb913e5ce36c25');
    await page.locator('.copy').first().click();
    await expect(page.locator('.copy').first()).toHaveText('Đã chép');
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip.startsWith('name: CI')).toBeTruthy();
    expect(clip).toContain('${{ secrets.GITHUB_TOKEN }}');
  });

  test('mọi lab render đủ bước, kiểm chứng và lỗi hay gặp', async ({ page }) => {
    const errors = trackErrors(page);
    for (let i = 1; i <= 11; i++) {
      const id = 'lab' + String(i).padStart(2, '0');
      await page.goto('/#/lab/' + id);
      await expect(page.locator('.crumbs')).toContainText(id.toUpperCase());
      expect(await page.locator('.step').count()).toBeGreaterThan(0);
      expect(await page.locator('.checkpoint .check').count()).toBeGreaterThan(0);
      expect(await page.locator('.pitfalls li').count()).toBeGreaterThan(0);
      expect(await page.locator('main').innerText()).not.toContain('undefined');
    }
    expect(errors).toEqual([]);
  });

  test('Dockerfile lab giữ biến ${NODE_VERSION}', async ({ page }) => {
    await page.goto('/#/lab/lab01');
    await expect(page.locator('.code').nth(1)).toContainText('FROM node:${NODE_VERSION}-alpine AS deps');
  });

  test('Lab 06 dùng Gateway API', async ({ page }) => {
    await page.goto('/#/lab/lab06');
    await expect(page.locator('h1')).toContainText('Gateway API');
    await expect(page.locator('.code').nth(1)).toContainText('kind: HTTPRoute');
    await expect(page.locator('.code').nth(0)).toContainText('envoyproxy/gateway-helm');
  });
});

test.describe('Giao diện', () => {
  test('đổi theme sáng/tối và lưu lại', async ({ page }) => {
    await page.goto('/#/');
    const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await page.locator('#themeBtn').click();
    const t1 = await page.evaluate(() => document.documentElement.dataset.theme);
    const bg1 = await bg();
    await page.locator('#themeBtn').click();
    const t2 = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(t1).not.toBe(t2);
    expect(await bg()).not.toBe(bg1);
    await page.reload();
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(t2);
  });

  test('đổi theme ngay trong trang học', async ({ page }) => {
    await page.goto('/#/learn/p00/0/0');
    const before = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await page.locator('.player-top [data-act="theme"]').click();
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).not.toBe(before);
  });

  test('theme tối theo hệ thống', async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(baseURL + '/#/');
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(16, 17, 27)');
    await ctx.close();
  });

  for (const route of ROUTES) {
    test(`không tràn ngang & không lỗi JS: ${route}`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.goto('/' + route);
      await expect(page.locator('main h1').first()).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      expect(errors).toEqual([]);
    });
  }

  test('mọi link tài liệu ngoài mở tab mới an toàn', async ({ page }) => {
    await page.goto('/#/phase/p08');
    await page.locator('[data-act="expand"]').click();
    const links = page.locator('.resources a');
    const n = await links.count();
    expect(n).toBeGreaterThan(10);
    for (let i = 0; i < n; i++) {
      await expect(links.nth(i)).toHaveAttribute('target', '_blank');
      await expect(links.nth(i)).toHaveAttribute('rel', /noopener/);
      await expect(links.nth(i)).toHaveAttribute('href', /^https?:\/\//);
    }
  });
});

test.describe('Accessibility (axe)', () => {
  for (const route of ['#/', '#/phase/p08', '#/learn/p07/1/0', '#/lab/lab03', '#/roadmap', '#/projects', '#/career', '#/progress']) {
    for (const theme of ['light', 'dark']) {
      test(`không có vi phạm nghiêm trọng: ${route} (${theme})`, async ({ page }) => {
        await page.addInitScript((t) => { try { localStorage.setItem('devpath-theme', t); } catch (e) {} }, theme);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/' + route);
        await expect(page.locator('main h1').first()).toBeVisible();
        const results = await new AxeBuilder({ page }).exclude('.code pre').exclude('.cover').analyze();
        const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact || ''));
        expect(serious.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
      });
    }
  }
});

test.describe('Nội dung kỹ thuật', () => {
  const load = () => {
    global.window = global.window || {};
    delete require.cache[require.resolve('../assets/js/data/labs.js')];
    delete require.cache[require.resolve('../assets/js/data/phases.js')];
    require('../assets/js/data/labs.js');
    require('../assets/js/data/phases.js');
    return { LABS: global.window.LABS, PHASES: global.window.PHASES };
  };

  test('mọi khối YAML trong labs đều hợp lệ', () => {
    const yaml = require('js-yaml');
    const { LABS } = load();
    const bad = [];
    for (const l of LABS) for (const s of l.steps) {
      if (s.lang !== 'yaml') continue;
      let code = s.code;
      if (/\(thêm\)|\(job bump\)/.test(s.file)) code = 'jobs:\n' + code; // đoạn trích để nối vào ci.yml
      if (s.file.includes('rules.yml')) code = code.split('# rules.yml')[1];
      try { yaml.loadAll(code); } catch (e) { bad.push(`${l.id} ${s.file}: ${e.message.split('\n')[0]}`); }
    }
    expect(bad).toEqual([]);
  });

  test('mọi GitHub Action được pin theo commit SHA', () => {
    const { LABS } = load();
    const uses = LABS.flatMap((l) => l.steps.flatMap((s) => (s.code.match(/uses:\s*[\w.-]+\/[\w.-]+@\S+/g) || [])));
    expect(uses.length).toBeGreaterThan(15);
    expect(uses.filter((u) => !/@[0-9a-f]{40}$/.test(u))).toEqual([]);
  });

  test('không còn hướng dẫn lỗi thời', () => {
    const { LABS, PHASES } = load();
    const all = JSON.stringify(LABS) + JSON.stringify(PHASES);
    expect(all).not.toMatch(/deploy-ingress-nginx|ingressClassName: nginx/);
    expect(all).not.toMatch(/Nghị định 13\/2023/);
    expect(all).not.toMatch(/postgres:1[0-7]-alpine|node:(18|20|22)-alpine|NODE_VERSION=22/);
    expect(all).toContain('OWASP Top 10:2025');
    expect(all).toContain('91/2025/QH15');
  });

  test('nội dung bài học của mọi chương hợp lệ và đầy đủ', () => {
    const { execFileSync } = require('child_process');
    const path = require('path');
    const out = execFileSync(process.execPath, [path.join(__dirname, 'validate-lessons.js')], { encoding: 'utf8' });
    expect(out).toContain('OK, không có lỗi');
    expect((out.match(/^p\d\d\.js$/gm) || []).length).toBe(14);
  });
});
