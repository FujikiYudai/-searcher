# 概要
特定のアーティストの全楽曲について、あるアーティストが提供している楽曲全てのテンポ、拍子、キー、調を表示します。

情報は、spotify APIから提供されるAudioFeaturesを使用しています(https://developer.spotify.com/documentation/web-api/reference/get-audio-features)。

恐らくAIを使って解析された情報であるため、たまに間違いがあります。

## 使用方法
使用には、spotify APIが必要になります。公式サイトで無料で取得できます([https://developer.spotify.com/documentation/web-api/tutorials/getting-started](https://developer.spotify.com/documentation/web-api/tutorials/getting-started)https://developer.spotify.com/documentation/web-api/tutorials/getting-started)

ダッシュボードから適当にアプリを作成すると、クライアントIDとクライアントシークレットが取得できます。

アプリの所定欄ににIDとシークレットまたはアクセストークンを書き込むことでも使用できます。

その後、任意のアーティスト名で検索してください。正式名称である必要はありません。

アーティストの候補が表示されるので、一つ選択すると楽曲情報の収集が始まります。

ほどなくして、情報が表示されると思います。

以下は、Mrs.Green Appleについて解析した例です。曲名やテンポと書かれているところを押すと、並び替えが可能です。

![image](https://github.com/FujikiYudai/-searcher/assets/134066481/3866b188-5922-471f-bffb-1bc2be7a5496)

### トークンやIDについて
本アプリでは、入力されたトークンやIDは楽曲情報取得のためにspotifyに送信する目的以外で使用されることは一切ありません。
