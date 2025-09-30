
export default function Login() {
    return(
        <div>
            <h1 style={{textAlign : "center",color : "white"}}>Welcome to vital Nest</h1>
            <div className="LoginPage">
                <form>
                    <div className="LoginLabel">
                        <label>AadharId</label>
                        <p><input required type = "text" placeholder = "Aadhar Id" name = "AadharId" pattern="\d{12}" maxLength={12} minLength={12} /></p>
                    </div>
                    <div className="LoginLabel">
                        <label>Password</label>
                        <p><input required type = "password" placeholder = "password" name = "Password" maxLength={15} minLength={8} /></p>
                    </div>
                    <button id="login_button">Login</button>
                </form>
            </div>
            <p id = "loginRegisterLink" ><a href="/register" style={{color : "white"}}>Not yet registered? Click here</a></p>
        </div>
    );
}