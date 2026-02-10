import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; トップページに戻る
        </Link>

        <h1 className="mt-8 text-3xl font-bold">利用規約</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          最終更新日: 2026年2月10日
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-lg font-semibold">第1条（適用）</h2>
            <p className="mt-2">
              本利用規約（以下「本規約」といいます）は、{APP_NAME}運営者（以下「当方」といいます）が提供するWebサービス「{APP_NAME}」（以下「本サービス」といいます）の利用に関する条件を定めるものです。利用者は、本規約に同意のうえ、本サービスをご利用ください。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">第2条（定義）</h2>
            <p className="mt-2">本規約において、以下の用語は以下の意味を有します。</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>「利用者」とは、本サービスを利用するすべての個人をいいます。</li>
              <li>「登録利用者」とは、本サービスにアカウントを登録した利用者をいいます。</li>
              <li>「コンテンツ」とは、利用者が本サービスに投稿・掲載したテキスト、画像、リンクその他の情報をいいます。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">第3条（アカウント登録）</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-6">
              <li>本サービスの利用にはアカウント登録が必要です。</li>
              <li>利用者は、13歳以上であることを条件にアカウントを登録できます。18歳未満の方は、保護者の同意を得たうえでご登録ください。</li>
              <li>利用者は、登録情報について正確かつ最新の情報を提供するものとし、虚偽の情報を登録してはなりません。</li>
              <li>利用者は、自己のアカウントの管理について一切の責任を負います。アカウントの不正利用による損害について、当方は一切の責任を負いません。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold">第4条（禁止事項）</h2>
            <p className="mt-2">
              利用者は、本サービスの利用にあたり、以下の行為を行ってはなりません。
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-6">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>差別、ヘイトスピーチ、脅迫、ハラスメントに該当する内容の投稿</li>
              <li>わいせつな表現、児童搾取に関する内容の投稿</li>
              <li>他者の知的財産権、プライバシー権、肖像権その他の権利を侵害する行為</li>
              <li>他者になりすます行為（なりすまし）</li>
              <li>スパム行為、不正なSEO目的でのページ作成</li>
              <li>マルウェア、ウイルスその他の有害なコードの配布</li>
              <li>本サービスのインフラストラクチャに過度な負荷をかける行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>不正アクセスまたはそれを試みる行為</li>
              <li>その他、当方が不適切と判断する行為</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold">第5条（コンテンツ）</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-6">
              <li>利用者が本サービスに投稿・掲載したコンテンツの著作権は、利用者に帰属します。</li>
              <li>利用者は、当方に対し、本サービスの提供・運営・改善・宣伝に必要な範囲で、コンテンツを使用（複製、表示、配信、改変を含む）する非独占的な権利を無償で許諾するものとします。</li>
              <li>当方は、利用者のコンテンツが本規約に違反すると判断した場合、事前の通知なくコンテンツを削除または非公開にすることができます。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold">第6条（料金・支払い）</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-6">
              <li>本サービスには無料プランと有料プラン（プロプラン）があります。</li>
              <li>有料プランの料金および支払い条件は、本サービス内の料金ページおよび特定商取引法に基づく表記に記載のとおりとします。</li>
              <li>有料プランの決済はStripe経由のクレジットカード払いとなります。</li>
              <li>有料プランはいつでも解約可能です。解約後は、当該請求期間の終了まで有料機能をご利用いただけます。日割りでの返金は行いません。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold">第7条（アカウントの停止・削除）</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-6">
              <li>当方は、利用者が本規約に違反した場合、または当方が必要と判断した場合、事前の通知なく利用者のアカウントを停止または削除することができます。</li>
              <li>利用者は、アプリ内の機能を通じて、いつでも自らアカウントを削除することができます。</li>
              <li>アカウント削除後、利用者のデータは合理的な期間内に削除されます。ただし、法令に基づき保持が必要な情報についてはこの限りではありません。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold">第8条（サービスの変更・中断・終了）</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-6">
              <li>当方は、利用者への事前の通知なく、本サービスの内容を変更し、または本サービスの提供を中断もしくは終了することができます。</li>
              <li>当方は、本サービスの提供の中断または終了により利用者に生じた損害について、一切の責任を負いません。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold">第9条（免責事項）</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-6">
              <li>本サービスは「現状有姿」で提供されます。当方は、本サービスの完全性、正確性、確実性、有用性、特定目的への適合性、可用性について、明示または黙示を問わず、いかなる保証も行いません。</li>
              <li>当方は、本サービスの利用により利用者に生じた損害について、当方の故意または重大な過失による場合を除き、一切の責任を負いません。</li>
              <li>当方が利用者に対して損害賠償責任を負う場合、その賠償額は、利用者が当方に支払った直近12か月間の利用料金の合計額を上限とします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold">第10条（個人情報の取り扱い）</h2>
            <p className="mt-2">
              利用者の個人情報の取り扱いについては、当方が別途定める
              <Link href="/privacy" className="text-primary underline underline-offset-4">
                プライバシーポリシー
              </Link>
              に従います。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">第11条（規約の変更）</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-6">
              <li>当方は、必要に応じて本規約を変更することができます。</li>
              <li>本規約の変更後、利用者が本サービスを継続して利用した場合、変更後の規約に同意したものとみなします。</li>
              <li>重要な変更がある場合は、本サービス内での通知またはメール等により利用者にお知らせします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold">第12条（準拠法・管轄裁判所）</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-6">
              <li>本規約の解釈および適用は、日本法に準拠します。</li>
              <li>本サービスに関連して利用者と当方との間で紛争が生じた場合、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold">第13条（お問い合わせ）</h2>
            <p className="mt-2">
              本規約に関するお問い合わせは、アプリ内のお問い合わせ機能よりご連絡ください。
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
