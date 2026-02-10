import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; トップページに戻る
        </Link>

        <h1 className="mt-8 text-3xl font-bold">プライバシーポリシー</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          最終更新日: 2026年2月10日
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-lg font-semibold">1. はじめに</h2>
            <p className="mt-2">
              {APP_NAME}運営者（以下「当方」といいます）は、{APP_NAME}（以下「本サービス」といいます）における利用者の個人情報の取り扱いについて、個人情報の保護に関する法律（個人情報保護法）をはじめとする日本の法令を遵守し、以下のとおりプライバシーポリシーを定めます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. 収集する情報</h2>
            <p className="mt-2">
              当方は、本サービスの提供にあたり、以下の情報を収集します。
            </p>
            <h3 className="mt-4 font-semibold">2.1 アカウント情報</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>メールアドレス</li>
              <li>ユーザー名</li>
              <li>表示名</li>
              <li>プロフィール情報（自己紹介文、リンク、連絡先情報など、利用者が任意で入力した情報）</li>
              <li>プロフィール画像（利用者が任意でアップロードした画像）</li>
            </ul>
            <h3 className="mt-4 font-semibold">2.2 アクセス情報</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>ページビュー数（IPアドレスに基づくサーバーサイドでのカウント）</li>
              <li>リファラー情報</li>
              <li>デバイス情報（ブラウザの種類、OS等）</li>
            </ul>
            <p className="mt-2">
              なお、本サービスではアナリティクス目的のCookie（クッキー）は使用しておりません。ページビューのカウントはサーバーサイドで処理されます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. 利用目的</h2>
            <p className="mt-2">
              収集した情報は、以下の目的で利用します。
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>本サービスの提供・運営・維持</li>
              <li>利用者のアカウント管理および認証</li>
              <li>プロフィールページの表示</li>
              <li>アクセス解析機能の提供（ページビュー数等の集計）</li>
              <li>本サービスの改善・新機能の開発</li>
              <li>利用者へのお知らせ・サポート対応</li>
              <li>不正利用の防止</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. 情報の保管</h2>
            <p className="mt-2">
              利用者の情報は、Supabase（サパベース）のサービスを利用して保管されます。Supabaseのサーバーは日本国外に所在する場合があります。当方は、適切なセキュリティ対策が講じられたサービスを選定し、利用者の情報の安全な管理に努めます。
            </p>
            <p className="mt-2">
              利用者がアップロードしたプロフィール画像は、Supabase Storageに保管されます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. 第三者への提供</h2>
            <p className="mt-2">
              当方は、以下の場合を除き、利用者の個人情報を第三者に提供しません。
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>利用者の同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>人の生命、身体または財産の保護のために必要がある場合であって、利用者の同意を得ることが困難である場合</li>
              <li>本サービスの提供に必要な範囲で業務委託先に提供する場合（決済処理のためのStripe等）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">6. 利用者の権利</h2>
            <p className="mt-2">
              利用者は、個人情報保護法に基づき、以下の権利を有します。
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>個人情報の開示請求</li>
              <li>個人情報の訂正・追加・削除の請求</li>
              <li>個人情報の利用停止・消去の請求</li>
              <li>個人情報の第三者提供の停止の請求</li>
            </ul>
            <p className="mt-2">
              上記の請求を行う場合は、アプリ内のお問い合わせ機能よりご連絡ください。ご本人確認のうえ、合理的な期間内に対応いたします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">7. 安全管理措置</h2>
            <p className="mt-2">
              当方は、個人情報の漏洩、滅失、毀損の防止その他の安全管理のために、以下の措置を講じます。
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>SSL/TLSによる通信の暗号化</li>
              <li>アクセス権限の適切な管理</li>
              <li>パスワードのハッシュ化による保管</li>
              <li>定期的なセキュリティ対策の見直し</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">8. 公開情報について</h2>
            <p className="mt-2">
              本サービスの性質上、利用者がプロフィールページに掲載した情報（表示名、自己紹介文、リンク、プロフィール画像等）は、インターネット上で一般に公開されます。公開される情報の内容は利用者ご自身の判断と責任においてご設定ください。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">9. プライバシーポリシーの変更</h2>
            <p className="mt-2">
              当方は、必要に応じて本プライバシーポリシーを変更することがあります。重要な変更がある場合は、本サービス内での通知またはメール等により利用者にお知らせします。変更後のプライバシーポリシーは、本ページに掲載した時点から効力を生じるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">10. お問い合わせ</h2>
            <p className="mt-2">
              本プライバシーポリシーに関するお問い合わせは、アプリ内のお問い合わせ機能よりご連絡ください。
            </p>
            <p className="mt-4">
              運営者: {APP_NAME}運営者（個人事業主）
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
