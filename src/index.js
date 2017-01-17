/**
 * @flow
 */

'use strict';

const NetEaseMusicAPIRequest = require('./NetEaseMusicAPIRequest');
const {
  headers,
  mobileLoginURI,
  emailLoginURI,
  songDetailURI
} = require('./NetEaseMusicAPIConfig');
const {encryptRequest, md5} = require('./encrypt');

const warning = require('warning');

type MobileLoginData = {
  phone: string,
  password: string,
  rememberLogin: string
};

type EmailLoginData = {
  username: string,
  password: string,
  rememberLogin: string
};

type LoginData = MobileLoginData | EmailLoginData;

type UserInfo = {
  nickname: string,
  avatarUrl: string,
  userId: number,
  password: string,
  cookies: Array<string>,
};

function login(username: string, password: string): Promise<UserInfo> {
  let data : LoginData;
  let loginURI : string;
  if (username.match(/^0\d{2,3}\d{7,8}$|^1[34578]\d{9}$/g)) {
    data = {
      phone: username,
      password: md5(password),
      rememberLogin: 'true'
    };
    loginURI = mobileLoginURI;
  } else {
    data = {
      username,
      password: md5(password),
      rememberLogin: 'true'
    };
    loginURI = emailLoginURI;
  }

  return new Promise((resolve, reject) => {
    const onSuccess = (responseText: any, headers: any) => {
      const profile = responseText ? responseText.profile : null;
      const cookies = headers ? headers['set-cookie'] : null;
      if (!(profile && cookies)) {
        reject(
          'Wrong format of response: either the encryption step is wrong or ' +
          'the password is incorrect.'
        );
        return;
      }
      // TODO: parse the response
      resolve({
        nickname: profile.nickname,
        avatarUrl: profile.avatarUrl,
        userId: profile.userId,
        password: password,
        cookies: cookies,
      });
    };

    const onError = err => {
      reject(err);
    };

    new NetEaseMusicAPIRequest(mobileLoginURI)
      .setData(encryptRequest(data))
      .setResponseHandler(onSuccess)
      .setErrorHandler(onError)
      .send();
  });
}

/**
 * This function is not finished yet....
 * https://github.com/akakoori/drrrbot/issues/18
 * Netease seems to have blocked all non Chinese IP address....
 * ヽ(.◕ฺˇд ˇ◕ฺ;)ﾉ
 */
function songsDetail(
  csrfToken: ?string,
  songIds: Array<number>,
  bitRate: number = 320000
): void {
  if (!csrfToken) {
    warning(false, 'You need to login.');
    return;
  }
  const data = {
    ids: songIds,
    br: bitRate,
    csrf_token: csrfToken
  };
  new NetEaseMusicAPIRequest(songDetailURI + csrfToken)
    .setData(encryptRequest(data))
    .setResponseHandler((response, headers) => {
      console.log(response, headers)
    })
    .send();
}

// login('phone_number|email', 'password')
//   .then(console.log)
//   .catch(console.log);
