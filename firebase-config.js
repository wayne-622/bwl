// Firebase 配置 - 从 Firebase Console 获取
// https://console.firebase.google.com → 项目设置 → 常规 → 你的应用 → 配置
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCGlQ0wzn3355fi2RQEF3AyXplejOLr5y8",
    authDomain: "wayne-chat.firebaseapp.com",
    databaseURL: "https://wayne-chat-default-rtdb.firebaseio.com",
    projectId: "wayne-chat",
    storageBucket: "wayne-chat.firebasestorage.app",
    messagingSenderId: "18461747473",
    appId: "1:18461747473:web:e5bec51f24e7608ebf04b0",
    measurementId: "G-75HB9FQ9YJ"
};

// EmailJS 配置 - 发送自定义验证码邮件
// 注册 https://www.emailjs.com （免费，200封/月）
// 1. 创建 Email Service → 拿到 serviceID
// 2. 创建 Email Template → 拿到 templateID，模板内容填 {{code}} 等变量
// 3. Account → API Keys → 拿到 publicKey
const EMAILJS_CONFIG = {
    publicKey: "FMvi1GmgSLbbGQ42x",
    serviceID: "service_d9og7b2",
    templateID: "template_gcbpxc7"
};
