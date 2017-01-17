/**
 * @flow
 */

'use strict';

const headers = {
  'Accept': '*/*',
  'Accept-Encoding': 'gzip,deflate,sdch',
  'Accept-Language': 'zh-CN,zh;q=0.8,gl;q=0.6,zh-TW;q=0.4',
  'Connection': 'keep-alive',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  'Host': 'music.163.com',
  'Referer': 'http://music.163.com/',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36'
};

const defaultTimeout = 10000;

// Login
const mobileLoginURI = 'https://music.163.com/weapi/login/cellphone/';
const emailLoginURI = 'https://music.163.com/weapi/login/';

// Songs
const songDetailURI = 'http://music.163.com/weapi/song/enhance/player/url?csrf_token=';


module.exports = {
  headers,
  defaultTimeout,
  emailLoginURI,
  mobileLoginURI,
  songDetailURI
};
