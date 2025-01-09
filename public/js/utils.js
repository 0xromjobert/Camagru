import { showAlert } from './alertComponent.js';
export async function fetchWithAuth(url, options = {}){
    console.log("in fetch with auth");
    const resp = fetch(url, options);
    if (resp.status == 401){
        showAlert("Your Session expired"); // to hqndle in authToken as it return res.status 401 with Json messqge straight
        window.location.href = "/auth/login";
    }
    return resp;
}