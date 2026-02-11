import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
};

export default function TokushohoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; トップページに戻る
        </Link>

        <h1 className="mt-8 text-3xl font-bold">特定商取引法に基づく表記</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          最終更新日: 2026年2月10日
        </p>

        <div className="mt-8 text-sm leading-relaxed text-foreground/90">
          <table className="w-full border-collapse">
            <tbody className="divide-y">
              <tr>
                <th className="w-1/3 border-b px-4 py-4 text-left align-top font-semibold">
                  販売事業者
                </th>
                <td className="border-b px-4 py-4">
                  {APP_NAME}運営者（個人事業主）
                </td>
              </tr>
              <tr>
                <th className="w-1/3 border-b px-4 py-4 text-left align-top font-semibold">
                  運営責任者
                </th>
                <td className="border-b px-4 py-4">
                  {APP_NAME}運営者
                  <p className="mt-1 text-xs text-muted-foreground">
                    ※ 請求があった場合、遅滞なく開示いたします。
                  </p>
                </td>
              </tr>
              <tr>
                <th className="w-1/3 border-b px-4 py-4 text-left align-top font-semibold">
                  所在地
                </th>
                <td className="border-b px-4 py-4">
                  請求があった場合、遅滞なく開示いたします。
                </td>
              </tr>
              <tr>
                <th className="w-1/3 border-b px-4 py-4 text-left align-top font-semibold">
                  連絡先
                </th>
                <td className="border-b px-4 py-4">
                  アプリ内お問い合わせ機能よりご連絡ください。
                  <p className="mt-1 text-xs text-muted-foreground">
                    ※ 電話番号については、請求があった場合、遅滞なく開示いたします。
                  </p>
                </td>
              </tr>
              <tr>
                <th className="w-1/3 border-b px-4 py-4 text-left align-top font-semibold">
                  販売価格
                </th>
                <td className="border-b px-4 py-4">
                  <ul className="list-disc space-y-1 pl-4">
                    <li>無料プラン: ¥0</li>
                    <li>Proプラン: 月額 ¥480（税込）/ 年額 ¥3,980（税込）</li>
                    <li>Pro+プラン: 月額 ¥1,480（税込）/ 年額 ¥11,800（税込）</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <th className="w-1/3 border-b px-4 py-4 text-left align-top font-semibold">
                  販売価格以外の必要料金
                </th>
                <td className="border-b px-4 py-4">
                  インターネット接続に必要な通信料等は利用者のご負担となります。
                </td>
              </tr>
              <tr>
                <th className="w-1/3 border-b px-4 py-4 text-left align-top font-semibold">
                  支払方法
                </th>
                <td className="border-b px-4 py-4">
                  クレジットカード（Stripe経由）
                </td>
              </tr>
              <tr>
                <th className="w-1/3 border-b px-4 py-4 text-left align-top font-semibold">
                  支払時期
                </th>
                <td className="border-b px-4 py-4">
                  プロプランへの申込時に初回の決済が行われ、以後毎月自動的に請求されます。
                </td>
              </tr>
              <tr>
                <th className="w-1/3 border-b px-4 py-4 text-left align-top font-semibold">
                  サービス提供時期
                </th>
                <td className="border-b px-4 py-4">
                  オンラインサービスのため、お申込み完了後、即時ご利用いただけます。
                </td>
              </tr>
              <tr>
                <th className="w-1/3 border-b px-4 py-4 text-left align-top font-semibold">
                  解約・返金について
                </th>
                <td className="border-b px-4 py-4">
                  <ul className="list-disc space-y-1 pl-4">
                    <li>有料プランはいつでも解約可能です。</li>
                    <li>解約後は、当該請求期間の終了まで有料機能をご利用いただけます。</li>
                    <li>日割りでの返金は行っておりません。</li>
                    <li>無料プランへの変更（ダウングレード）はいつでも可能です。</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <th className="w-1/3 border-b px-4 py-4 text-left align-top font-semibold">
                  動作環境
                </th>
                <td className="border-b px-4 py-4">
                  インターネットに接続可能なモダンブラウザ（Chrome、Safari、Firefox、Edge等の最新版）
                </td>
              </tr>
              <tr>
                <th className="w-1/3 px-4 py-4 text-left align-top font-semibold">
                  特記事項
                </th>
                <td className="px-4 py-4">
                  本サービスの利用規約は
                  <Link href="/terms" className="text-primary underline underline-offset-4">
                    こちら
                  </Link>
                  、プライバシーポリシーは
                  <Link href="/privacy" className="text-primary underline underline-offset-4">
                    こちら
                  </Link>
                  をご確認ください。
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
