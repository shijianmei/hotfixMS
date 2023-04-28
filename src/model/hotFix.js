import _axios, { get, put, _delete } from '@/lin/plugin/axios'


class HotFix {
    constructor(uPage = 0, uCount = 20) {
        this.uPage = uPage
        this.uCount = uCount        
    }
   
    static async getHotFixList(count, page) {     
        
        let res = await get('v1/hotFix', {
            count,
            page,            
          })
        return res
      }
    static async addHotFix(data) {
        return _axios({
            method: 'post',
            url: 'v1/hotFix',
            data,
          });
    }
    // status 1:发布中, 2:暂停 ,0:结束
    static async editHotFix(id, status) {
        const res = await put(`v1/hotFix/${id}`, {status})
        return res
    }
   
}

 
export {HotFix as HotFixModel}