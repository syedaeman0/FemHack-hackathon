function register(e) {
    if (e) e.preventDefault();
    var name = document.getElementById("name").value
    var email = document.getElementById("email").value
    var phone = document.getElementById("phone").value
    var password = document.getElementById("password").value
    var cpassword = document.getElementById("cpassword").value

    if (!name || !email || !password) {
        Swal.fire('Error', "All fields are required", 'error');
        return
    }

    if (password !== cpassword) {
        Swal.fire('Error', "Passwords should be identical", 'error');
        return
    }

    // Get existing users
    var users = JSON.parse(localStorage.getItem("users")) || []

    // Check for unique email
    var emailExists = users.some(function (user) { return user.email === email })
    if (emailExists) {
        Swal.fire('Error', "Email already registered!", 'error');
        return
    }

    var data = {
        name: name,
        email: email,
        phone: phone,
        password: password
    }

    users.push(data)
    localStorage.setItem("users", JSON.stringify(users))

    // Auto-login or redirect
    localStorage.setItem("currentUser", JSON.stringify(data))
    Swal.fire({
        title: 'Success!',
        text: name + " Registered Successfully",
        icon: 'success',
        confirmButtonColor: '#282354',
        id:'signinbtn'
    }).then(() => {
        window.location.href = "dashboard.html"
    });
}

function login(e) {
    if (e) e.preventDefault();
    var loginEmail = document.getElementById("loginEmail").value
    var loginPass = document.getElementById("loginPass").value

    var users = JSON.parse(localStorage.getItem("users")) || []

    var user = users.find(function (u) {
        return u.email === loginEmail && u.password === loginPass
    })

    if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user))
        Swal.fire({
            title: 'Welcome!',
            text: "Login Successful",
            icon: 'success',
            confirmButtonColor: '#282354',
            id: 'loginbtn'
        }).then(() => {
            window.location.href = "dashboard.html"
        });
    } else {
        Swal.fire('Error', "Invalid Email or Password", 'error');
    }
}

function logout() {
    localStorage.removeItem("currentUser")
    window.location.href = "index.html"
}
