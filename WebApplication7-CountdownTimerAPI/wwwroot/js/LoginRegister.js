var loginText = document.getElementById("user-login").innerHTML;

$("#user-login").on("click", e => {
    let log = document.getElementById("user-login").innerHTML;
    //if (loginText == "login") {
    //    log = "logout";
    //}
    Swal.fire({
        title: 'Welcome',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Register',
        denyButtonText: log,
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Register Form',
                html: `<input type="text" id="login" class="swal2-input" placeholder="Email">
                        <input type="password" id="password" class="swal2-input" placeholder="Password">
                        <input type="password" id="password-confirm" class="swal2-input" placeholder="Password Confirm">
                        <input type="text" id="name" class="swal2-input" placeholder="Username">
                        <input type="text" id="phone" class="swal2-input" placeholder="Phone">`,
                confirmButtonText: 'Register',
                focusConfirm: false,
                preConfirm: () => {
                    const login = Swal.getPopup().querySelector('#login').value;
                    const name = Swal.getPopup().querySelector('#name').value;
                    const password = Swal.getPopup().querySelector('#password').value;
                    const passwordConfirm = Swal.getPopup().querySelector('#password-confirm').value;
                    const phone = Swal.getPopup().querySelector('#phone').value;
                    if (password !== passwordConfirm) {
                        Swal.showValidationMessage(`Passwords don't match'`);
                    }
                    if (!login || !password || !name || !phone || !passwordConfirm) {
                        Swal.showValidationMessage(`Please enter all inputs`);
                    }
                    return { login: login, password: password, passwordConfirm: passwordConfirm, name: name, phone: phone }
                }
            }).then((result) => {
                //Swal.fire(`
                //    Login: ${result.value.login}
                //    Password: ${result.value.password}
                //    Password Confirm: ${result.value.passwordConfirm}
                //    Name: ${result.value.name}
                //    Phone: ${result.value.phone}
                //`.trim());
                fetch("/api/auth/register", {
                    method: "POST",
                    headers: {
                        'Content-Type': "application/json"
                    },
                    body: JSON.stringify({
                        UserName: result.value.name,
                        Phone: result.value.phone,
                        Email: result.value.login,
                        Password: result.value.password
                    })
                }).then(r => r.json()).then(response => {
                    console.log("response", response);
                    if (response.success == true) {
                        Swal.fire({
                            position: 'top-end',
                            icon: 'success',
                            title: 'Success',
                            showConfirmButton: false,
                            timer: 1000
                        });
                       
                    } else {
                        Swal.fire({
                            position: 'top-end',
                            icon: 'error',
                            title: response.error,
                            showConfirmButton: false,
                            timer: 1000
                        })
                    }

                })
            })
        } else if (result.isDenied) {
            log = document.getElementById("user-login").innerHTML;
            console.log("log", log);
            if (log == "Login") {
                Swal.fire({
                    title: 'Login Form',
                    html: `<input type="text" id="login" class="swal2-input" placeholder="Username">
                        <input type="password" id="password" class="swal2-input" placeholder="Password">`,
                    confirmButtonText: 'Sign in',
                    focusConfirm: false,
                    preConfirm: () => {
                        const login = Swal.getPopup().querySelector('#login').value;
                        const password = Swal.getPopup().querySelector('#password').value;
                        if (!login || !password) {
                            Swal.showValidationMessage(`Please enter login and password`);
                        }
                        return { login: login, password: password }
                    }
                }).then((result) => {
                    //Swal.fire(`
                    //    Login: ${result.value.login}
                    //    Password: ${result.value.password}
                    //`.trim());
                    fetch("/api/auth/login", {
                        method: "POST",
                        headers: {
                            'Content-Type': "application/json"
                        },
                        body: JSON.stringify({
                            Email: result.value.login,
                            Password: result.value.password
                        })
                    }).then(r => r.json()).then(response => {
                        console.log("response", response);
                        if (response.success == true) {
                            Swal.fire({
                                position: 'top-end',
                                icon: 'success',
                                title: 'Success',
                                showConfirmButton: false,
                                timer: 1000
                            });
                            let token = JSON.stringify(response.token);
                            localStorage.setItem("token", token);
                            var millisecondsToWait = 1500;
                            setTimeout(function () {
                                location.reload();
                            }, millisecondsToWait);
                        } else {
                            Swal.fire({
                                position: 'top-end',
                                icon: 'error',
                                title: response.error,
                                showConfirmButton: false,
                                timer: 1000
                            })
                        }
                    })
                })
            } else {
                // logout
                //remove token from localStorage
                let delToken = "";
                localStorage.setItem("token", delToken);
                location.reload();
                //Swal.fire("test");
            }
        }
        checkAuth();
    })

});
