import './provider.css' 

function SignupProvider() {
  return (
    <>
    <div className="provider-container">
        <div className="img_div">

        </div>
        
    <form>
        <input type="text" placeholder="Noms" />
        <input type="text" placeholder="Prénoms" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Sign up</button>
    </form>
    </div>
      
    </>
  )
}

export default SignupProvider