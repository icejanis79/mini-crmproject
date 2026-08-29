const { google } = require('googleapis');

async function checkDrive() {
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL || 'crm-bot@fluid-vector-496317-c2.iam.gserviceaccount.com',
    private_key: (process.env.GOOGLE_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDMVcJ7dxid/JWi\n1v/+QAcsBzkOFnW5hnOzMWFFHz0jK6rGHyzoMAFqnlSI1TT9TxpbPIFTXeJWiTiX\n6fTYOzDOXZg0ggYVO7GqM7eLXeRB8UchoR4IEuqCnOJAiVwmjYKEyuWCLQCZFZJr\nnyq36VpGQmelxEpRxT1ocQcmvi5784xVGAXdhtZ8Veh/jltlVjL/ia2J2ljjP4i5\n9a3GonNVLVk/UGrYtdHszcjrZC9eIu3bOieHqrEOIA3kDHB3kG1/j2j2XJ4cEmah\nEJxj/HI/oveCtTah8Enc7wyDdwnjAFuUuc7m5wrsvvcZae02rBSF+pEv9UXgX+AV\no7h5IBdPAgMBAAECggEAZc/jaB5m4y1cJ7el9PrVOABfUuApB2hxVNtpYoYWseQL\nos0c1JI62nOKnmVRklesQ8KJk87nPIQB8Vuu1mDjyCeFc8BHpKPKOgqrzSLa3WqJ\nrT1418AJHkxqRYrLoiAHZQAtzCd9MUm426wCnoGErBZhS4zbFRRIrTYIQKspQTOr\nzJQEY7hJshjVfN3tlT0dp9nagSux/xfRVV0cIUJ4ZERxNeMgVqn5Lgml6s5qPmZz\npzkGy/W0MB285U5wXZWOOS9F4qTZhxOWGmIMsVBt1bNofZOmUs52ve1aRatiCrKj\nF7tESRWXtM0Be+WzOL1VNq7abBCAtuUhUXIkm1Qw3QKBgQD4O5uWA3cJS8TAMHgo\nydcLAqWdGJCCJY7/n3h5R3sri4Twtl4YPiCjcWcZ1v6FFB8aVPfiX6a9J7lystuH\nDHmtDY7m3iH5S9mVT/lE+vQ1poxlTiWUyP21UpVVaGgkLlcwyDWTmStlIwSm0pgM\ncz3gsjv/Xz02UWOnTTUtEfpuOwKBgQDSuoWZChwNOJMy8x7RWeydQfFGciAud+cG\nkWC9RLE90VeN4mf5efij/JKRFONvtnGUvTypJLQDuMpPlA3oCNDExlxRXS9RbW39\nGvsOLV4WbPr5Wg2YvfYTiy9EEQGsjtNCitVFIL3/Sk3mk0lQbpHYhsEq6KJqzxpj\nGs6qh84F/QKBgQC3l6aH+gIVTwOyvWZxjG7OxuNkYCGpEExGBVUeJd8UIrltKwRG\n29RZ7eq6MsfF907Vs9guhl4U8od3LI+uv2xSsH9rgwkPj6jahO6wtQbfk1GtL3Ie\nK9VxQSYPqAu2DswP2VO+2X896vtqwsEQHD+8qzYytubYALQ6raDRt8VHtwKBgQDA\nLp2S0fZ9VEBisflEIoe5b59UiNayqmVGxyT71/7xCs+XtYjvq/5HyBv/NpapljEF\n3oPJGpEV59ySMMtx90A2hVVCWwLBd1RdBdM6vcNWHnPRHwDRcUVP05r6r6vgLK2c\nvTL9hXvhrGlZRLATK5PVbigTMvCVCmXdRmB+g7YwHQKBgQCKc9YZKU+UiS08+KC+\nu/lt0mp1QNsvNKw465aLoyHQ9mu7EjOgmNB8siVLNTBhPtiXPEXtWpKf1r4IMNhk\ne5oKhW2oHLtYY2xWZsQJ0xktq93m8e3JTh6HYcj9HcfN20S9lIhtiU9OHY2aNJfj\nlKCO0h1xkJjfKL0G0ngy4ppRMQ==\n-----END PRIVATE KEY-----\n').replace(/\\n/g, '\n'),
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });

  try {
    const res = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and name='ใบเสนอราคา_QCH'",
      fields: 'files(id, name)',
    });
    const folders = res.data.files;
    console.log('Folders found:', folders);
    
    if (folders.length > 0) {
      const folderId = folders[0].id;
      const fileRes = await drive.files.list({
        q: `'${folderId}' in parents`,
        fields: 'files(id, name, mimeType)',
      });
      console.log('Files in folder:', fileRes.data.files);
    }
  } catch (err) {
    console.error('The API returned an error: ' + err);
  }
}

checkDrive();
