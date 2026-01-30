function register(){
    event.preventDefault()
    var name = document.getElementById("name").value
    var email = document.getElementById("email").value
    var phone = document.getElementById("phone").value
    var password = document.getElementById("password").value
    var cpassword = document.getElementById("cpassword").value

    var data = {
        name: name,
        email,
        phone,
        password,
        cpassword
    }
    if(!name){
        alert("Name is required")
    }else if(password !== cpassword){
        alert("Passwords should be identical")
    }else{
        localStorage.setItem("data",JSON.stringify(data))
        alert(name+" Registered Successfully")
        window.location.href="/dashboard.html"
    }
    
}
function renderData(){
    
    var getData = JSON.parse(localStorage.getItem("data"))
    // console.log(getData);
   var displaydata = document.getElementById("displayData")
   displaydata.innerHTML =`
      <li> Name: ${getData.name}</li>
      <li> Email: ${getData.email}</li>
      <li> Phone: ${getData.phone}</li>
   `
}
renderData()

function login(){
    event.preventDefault()
    var loginEmail = document.getElementById("loginEmail").value
    var loginPass = document.getElementById("loginPass").value
    var getData = JSON.parse(localStorage.getItem("data"))
    // console.log(loginEmail,getData.email, loginPass,getData.password);
    if(getData.email !== loginEmail){
        alert("Invalid Email")
    }else if(getData.password !== loginPass){
        alert("Invalid Password")
    }else{
        alert("Login Successful")
        window.location.href="/dashboard.html"
    }

}
function logout(){
    window.location.href = "/"
}