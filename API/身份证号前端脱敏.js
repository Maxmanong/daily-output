let certificateNumber= '37098219920130367X';
certificateNumber = certificateNumber.replace(/^(.{4})(?:\d+)(.{4})$/,"$1****$2")
console.log(certificateNumber)