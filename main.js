const btn = document.getElementById("btn");
const getTokenBtn = document.getElementById("getTokenBtn");
const artistName = document.getElementById("artistName");
const nowstatus = document.getElementById("status");
const clientID = document.getElementById("clientID");
const clientSecret = document.getElementById("clientSecret");

// アーティストの楽曲とidを入れる辞書
var tracks={}
// 楽曲と特徴量の辞書
var tracksFeatures={}

// 一時トークン
var token = document.getElementById("accessToken").value;
//  検索ボタンが押されたとき、検索結果の表示
btn.addEventListener("click",()=>{
  // 初期化
  tracks={}
  tracksFeatures={}
  // httpリクエスト
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.spotify.com/v1/search?q='+artistName.value+'&type=artist');
    token = document.getElementById("accessToken").value
    console.log(token)
    // トークンが空欄で、リクエストが可能ならばリクエスト
    if (token == "" &&clientID.value!="" && clientSecret.value!="") {
      getTokenBtn.click();
    }
    xhr.setRequestHeader('Authorization', 'Bearer '+token);
    xhr.onload = function() {
      // リクエスト成功
      if (xhr.status === 200) {
        nowstatus.textContent="検索完了";
        obj=JSON.parse(xhr.responseText);
        console.log(obj.artists.items);
        // 検索結果を格納するdivの作成
        if (document.getElementById("searchArtists") != null) {
          document.getElementById("searchArtists").remove();
        }
        if (document.getElementById("sort_table") != null) {
          document.getElementById("sort_table").remove();
        }
        var searchArtists = document.createElement('div');
        searchArtists.id="searchArtists";
        document.body.appendChild(searchArtists);
        // 検索結果を表示
        for (let i = 0; i < obj.artists.items.length; i++) {
            const element = obj.artists.items[i];
            console.log(element.name);
            var div = document.createElement('div');
            var p = document.createElement('p');
            p.textContent = element.name;
            var img = document.createElement('img');
            img.src=element.images[1].url;
            img.alt=element.name;
            img.width=element.images[1].width;
            img.height=element.images[1].height;
            div.appendChild(img);
            div.appendChild(p);
            div.id=element.id;
            div.className="artist";
            // onclickを定義
            div.onclick=function(){selectArtist(element.id)};
            searchArtists.appendChild(div);
        }
      }
      // リクエスト失敗
      else {
        console.log(xhr.responseText);
        nowstatus.textContent=xhr.responseText;
      }
    };
    xhr.send();
}
)
// トークン取得ボタンが押されたとき、アクセストークンをinputに入れる
getTokenBtn.addEventListener("click",()=>{
  console.log("トークン取得");
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://accounts.spotify.com/api/token',false);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange=function(){
    if(xhr.readyState==4){
      // 失敗時の処理
      if (xhr.status!=200){
        nowstatus.textContent=xhr.responseText;
      }else{
        console.log(xhr.responseText);
      obj=JSON.parse(xhr.responseText);
      token=obj.access_token;
      document.getElementById("accessToken").value=token;
      }
    }};
  xhr.send('grant_type=client_credentials&client_id='+clientID.value+'&client_secret='+clientSecret.value);
})
// アーティストが選択されたとき
async function selectArtist(id){
  // 検索結果を消去
  var searchArtists = document.getElementById("searchArtists");
  searchArtists.remove();
  console.log("除去");
  // 全アルバムを取得
  nowstatus.textContent="アルバム取得中";
  await _sleep(10);
  var albums=getAlbums(id,false);
  console.log("アルバム",albums);
  // アルバムidから全楽曲名と楽曲idを取得
  nowstatus.textContent="楽曲取得中(ちょっと時間かかるかも)";
  await _sleep(10);
  for (let i = 0; i < albums.length; i++) {
    const element = albums[i];
      getAlbumTracks(element.id,false);
  }
  console.log("楽曲",tracks);
  // 楽曲idから楽曲の特徴量を取得
  nowstatus.textContent="楽曲情報取得中(時間かかるかも)";
  await _sleep(10);
  for (var key in tracks) {
    getAudioFeatures(key,tracks[key],false);
    // console.log(key,tracks[key]);
  }
  console.log("特徴量",tracksFeatures);
  // 楽曲とその特徴量を表として表示
  nowstatus.textContent="表作成中";
  await _sleep(10);
  displayTracks(tracksFeatures);
  nowstatus.textContent="表作成完了";
  await _sleep(10);
};
// アーティストidからアルバムの配列を返す
function getAlbums(id,wait){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.spotify.com/v1/artists/'+id+'/albums?include_groups=single%2Calbum&limit=50',wait);
  xhr.setRequestHeader('Authorization', 'Bearer '+token);
  xhr.onload =function() {
    if (xhr.status === 200) {
      obj=JSON.parse(xhr.responseText);
      // console.log(obj.items);
      
    }
    else {
      console.log(xhr.responseText);
      nowstatus.textContent=xhr.responseText;
    }
  }
  xhr.send();
  return obj.items;
}
// アルバムidから楽曲と楽曲idををtracksに格納
function getAlbumTracks(Albumid,wait){
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://api.spotify.com/v1/albums/'+Albumid+'/tracks?limit=50',wait);
      xhr.setRequestHeader('Authorization', 'Bearer '+token);
      xhr.onload = function() {
        if(xhr.status === 200){
          obj=JSON.parse(xhr.responseText);
          // console.log(obj.items);
          for (let i = 0; i < obj.items.length; i++) {
            const element = obj.items[i];
            // console.log(obj.items[i].name,obj.items[i].id);
            if (!(element.name  in tracks)){
              // console.log(obj.items[i].name,obj.items[i].id)
              tracks[element.name]=element.id;
            }
          }
        }
        else{
          console.log(xhr.responseText);
          nowstatus.textContent=xhr.responseText;
        }
        }
      
      xhr.send();
  }
// tracksを表示する
function displayTracks(){
  // tracksを表にして表示
  var table = document.createElement('table');
  table.id="sort_table";
  document.body.appendChild(table);
  // 表のヘッダーを作成
  var tr = document.createElement('tr');
  var th = document.createElement('th');
  th.textContent="曲名";
  tr.appendChild(th);
  var th = document.createElement('th');
  th.textContent="テンポ";
  tr.appendChild(th);
  var th = document.createElement('th');
  th.textContent="拍子";
  tr.appendChild(th);
  var th = document.createElement('th');
  th.textContent="キー";
  tr.appendChild(th);
  var th = document.createElement('th');
  th.textContent="調";
  tr.appendChild(th);

  table.appendChild(tr);
  // 表の中身を作成
  for (var key in tracksFeatures) {
    // console.log(key)
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    td.textContent=key;
    tr.appendChild(td);
    var td = document.createElement('td');
    td.textContent=tracksFeatures[key].tempo;
    tr.appendChild(td);
    var td = document.createElement('td');
    td.textContent=tracksFeatures[key].time_signature;
    tr.appendChild(td);
    var td = document.createElement('td');
    td.textContent=keyDecode(tracksFeatures[key].key);
    tr.appendChild(td);
    var td = document.createElement('td');
    td.textContent=modeDecode(tracksFeatures[key].mode);
    tr.appendChild(td);

    table.appendChild(tr);
    // console.log(key,tracks[key]);
  }
}
// audioIDから特徴量を取得、曲名をキーとしてtracksFeaturesに格納
function getAudioFeatures(AudioName,AudioId,wait){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.spotify.com/v1/audio-features/'+AudioId,wait);
  xhr.setRequestHeader('Authorization', 'Bearer '+token);
  xhr.onload = function() {
    if(xhr.status === 200){
      obj=JSON.parse(xhr.responseText);
      // console.log(obj);
      tracksFeatures[AudioName]=obj;
    }
    else{
      console.log(xhr.responseText);
    }
  }
  xhr.send();
}
// キーの数字を記号に変換
function keyDecode(key){
  switch (key) {
    case 0:
      return "C";
      break;
    case 1:
      return "C♯,D♭";
      break;
    case 2:
      return "D";
      break;
    case 3:
      return "D♯,E♭";
      break;
    case 4:
      return "E";
      break;
    case 5:
      return "F";
      break;
    case 6:
      return "F♯,G♭";
      break;
    case 7:
      return "G";
      break;
    case 8:
      return "G♯,A♭";
      break;
    case 9:
      return "A";
      break;
    case 10:
      return "A♯,B♭";
      break;
    case 11:
      return "B";
      break;
    default:
      return "unknown";
      break;
  }
}
// 調の数字を記号に変換
function modeDecode(mode){
  switch (mode) {
    case 0:
      return "minor";
      break;
    case 1:
      return "major";
      break;
    default:
      return "unknown";
      break;
  }
}
// 一時停止
const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 表をソート
let column_no_prev = 0; //前回クリックされた列番号
window.addEventListener('click', function () {
  console.log("click");
	let column_no = 0; //今回クリックされた列番号

	document.querySelectorAll('#sort_table th').forEach(elm => {
		elm.onclick = function () {
			column_no = this.cellIndex; //クリックされた列番号

			let table = this.parentNode.parentNode;
      console.log(table)
			let sortType = 0; //0:数値 1:文字
			let sortArray = new Array; //クリックした列のデータを全て格納する配列
			for (let r = 1; r < table.rows.length; r++) {
				//行番号と値を配列に格納
				let column = new Object;
				column.row = table.rows[r];
				column.value = table.rows[r].cells[column_no].textContent;
				sortArray.push(column);
				//数値判定
				if (isNaN(Number(column.value))) {
					sortType = 1; //値が数値変換できなかった場合は文字列ソート
				}
			}
			if (sortType == 0) { //数値ソート
				if (column_no_prev == column_no) { //同じ列が2回クリックされた場合は降順ソート
					sortArray.sort(compareNumberDesc);
				} else {
					sortArray.sort(compareNumber);
				}
			} else { //文字列ソート
				if (column_no_prev == column_no) { //同じ列が2回クリックされた場合は降順ソート
					sortArray.sort(compareStringDesc);
				} else {
					sortArray.sort(compareString);
				}
			}
			//ソート後のTRオブジェクトを順番にtbodyへ追加（移動）
			let tbody = this.parentNode.parentNode;
			for (let i = 0; i < sortArray.length; i++) {
				tbody.appendChild(sortArray[i].row);
			}
			//昇順／降順ソート切り替えのために列番号を保存
      console.log(column_no, column_no_prev);
			if (column_no_prev == column_no) {
				column_no_prev = -1; //降順ソート
			} else {
				column_no_prev = column_no;
			}
		};
	});
});
//数値ソート（昇順）
function compareNumber(a, b)
{
	return a.value - b.value;
}
//数値ソート（降順）
function compareNumberDesc(a, b)
{
	return b.value - a.value;
}
//文字列ソート（昇順）
function compareString(a, b) {
	if (a.value < b.value) {
		return -1;
	} else {
		return 1;
	}
	return 0;
}
//文字列ソート（降順）
function compareStringDesc(a, b) {
	if (a.value > b.value) {
		return -1;
	} else {
		return 1;
	}
	return 0;
}