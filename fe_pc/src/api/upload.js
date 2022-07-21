import request from '@/utils/request'

export function uploadMobiles(opts) {
  console.log('上传文件data = ', opts);

  let data = new FormData();
  data.append(opts.filename, opts.file)

  function onProgressFn(e){
    e.percent = Math.floor(e.loaded * 100 / e.total);
    opts.onProgress(e, opts.file, opts.fileList)
  }

  return request({
    url: opts.action,
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress : onProgressFn
  });
}


