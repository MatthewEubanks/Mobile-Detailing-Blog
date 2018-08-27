let jwt;

//AUTH
function rememberUserLog() {
    $(document).ready(function () {
        if (sessionStorage.getItem('authToken')) {
            $.ajax({
                type: "POST",
                url: "/auth/refresh",
                dataType: "json",
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('authToken')}`
                },
                success: function (res) {
                    console.log(res);
                    jwt = res.authToken;
                    sessionStorage.setItem('authToken', jwt);
                    showDashboard(sessionStorage.getItem('username'));
                }
            });
        }
    });
}

//NAV BAR FUNCTION
function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "navbar") {
        x.className += " responsive";
    } else {
        x.className = "navbar";
    }
}

function handleHambugerClick() {
    $('.fa fa-bars').on('click', function (event) {
        event.preventDefault();
        myFunction();
    });
}
//SHOW HOME PAGE
function showBlogPosts() {
    $.getJSON("/posts", function (data) {
        for (let i = 0; i < data.length; i++) {
            $(`<div class="blogContainer"><div class="content">
                <img src="">
                <h3><a href ="#" entry-id="${data[i].id}" class="title">${data[i].title}</a></h3>
                </div>`).appendTo(".blogPosts");
        }
    });
}

function displayHomePage() {

    const showLogin = renderLoginPage();
    $('.new').hide();
    $('.blogPosts').html(showLogin);
    $('.blogPosts').show();
    console.log('Display Home');
}

function homeButton() {
    $('.area').on('click', '.home', function (event) {
        console.log('Home button clicked');
        event.preventDefault();
        displayHomePage();

    });
}

//SINGLE POST PAGE
function renderSinglePost(response) {
    return `
    <div class="blogContainer" id="singlePost">
        <div class="content">
            <img src="${response.picture}">
                <h3>
                    <a href ="#" id="${response.id}" class="title">${response.title}</a>
                </h3>
            <p>${response.content}</p>
        </div>
        <!--<div class="author">
            <p>${response.author}</p>
        </div> -->
        <div class="edit" >
            <button class="edit-button" data-entryid="${response.id}">Edit</button>    
        </div>
        <div class="delete">
            <button class="delete-button" data-entryid="${response.id}">Delete</button>    
        </div>
    </div>
    `;
}

function displayIndividualPost(response) {
    const singlePost = renderSinglePost(response);
    $('.blogPosts').hide();
    $('.new').html(singlePost);
    $('.new').show();
}

function getIndividualPost(id, callback) {
    console.log(id);
    //const newId = id.id;
    $.ajax({
        type: "GET",
        url: `/posts/${id}`,
        dataType: "json",
        contentType: "application/json",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.getItem('authToken'));
        },
        success: function (response) {
            console.log('reachec display individual');
            displayIndividualPost(response);
        }
    });
}

function handleTitleClick() {
    $('.area').on('click', '.title', function () {
        console.log('Title of Post clicked');
        const id = $(this).attr('id');
        console.log(id);
        getIndividualPost(id);
    });
}

//SIGN UP PAGE
function renderSignUp() {
    return `
    <div class="container" id="signupCntnr">
    <form role="form" class="signUp" id="signUp">
        <div class="signUp-header">
            <legend align="center">Sign Up</legend>
        </div>
        <div class="row">
            <div class="col-25">
                <label for="fName">First Name</label>
            </div>
            <div class="col-75">
                <input class="signUp-form" type="text" id="fName" name="firstName" placeholder="Your Name..." required>
            </div>
        </div>
        <div class="row">
            <div class="col-25">
                <label for="lName">Last Name</label>
            </div>
            <div class="col-75">
                <input class="signUp-form" type="text" id="lName" name="lastName" placeholder="Your Name..." required>
            </div>
        </div>
        <div class="row">
            <div class="col-25">
                <label for="email">Email</label>
            </div>
            <div class="col-75">
                <input class="signUp-form" type="Email" id="email" name="email" placeholder="Email Address" required>
            </div>
        </div>
        <div class="row">
            <div class="col-25">
                <label for="password">Password</label>
            </div>
            <div class="col-75">
                <input class="signUp-form" type="password" id="password" name="password" placeholder="Password" required>
            </div>
        </div>
        <div class="row">
            <div class="col-25">
                <label for="password-confirm">Confirm</label>
            </div>
            <div class="col-75">
                <input class="signUp-form" type="password" id="password-confirm" name="password" placeholder="Confirm Password" required>
            </div>
        </div>
        <div class="row">
            <input type="submit" class="signUp-btn" value="Submit">
        </div>
    </form>
</div>
            `;
}

function displaySignUp() {
    const signUpPage = renderSignUp();
    $('.blogPosts').hide();
    $('.new').html(signUpPage);
    $('.new').show();
}

function handleSignUpClick() {
    $('.area').on('click', '.signup', function (event) {
        event.preventDefault();
        displaySignUp();
    });
}

function signUpSuccess() {
    $('.area').on('submit', '.signUp', function (event) {
        console.log('SignUp Success');
        event.preventDefault();
        //get values from sign up form
        const firstName = $('#fName').val();
        const lastName = $('#lName').val();
        const username = $('#email').val();
        const password = $('#password').val();
        const confirmPassword = $('#password-confirm').val();

        //validate user inputs
        // validate user inputs
        if (username == '')
            alert('Must input username');
        else if (password == '')
            alert('Must input password');
        else if (confirmPassword == '')
            alert('Must re-enter password');
        else if (password != confirmPassword)
            alert('Passwords do not match');
        // if valid
        else {
            // create the payload object (what data we send to the api call)
            const newUserObject = {
                firstName: firstName,
                lastName: lastName,
                username: username,
                password: password
            };
            // make the api call using the payload above
            $.ajax({
                    type: 'POST',
                    url: '/users/',
                    dataType: 'json',
                    data: JSON.stringify(newUserObject),
                    contentType: 'application/json'
                })
                // if call is successful
                .done(function () {
                    alert('Account created! Please, log in!');
                    displayLoginPage();
                })
                //if the call is failing
                .fail(function (err) {
                    console.error(err);
                    alert(`Sign up error: ${err.responseJSON.message}`);
                });
        }

    });
}

//LOGIN PAGE
function renderLoginPage() {
    return `
    <div class="container" id="login-cntnr">
    <form role="form" class="login" id="login">
        <div class="login-header">
            <legend align="center">Log In to Start Posting</legend>
        </div>
        <div class="row">
            <div class="col-25">
                <label for="email">Email</label>
            </div>
            <div class="col-75">
                <input class="login-form" type="Email" id="email" name="email" placeholder="Email Address" required>
            </div>
        </div>
        <div class="row">
            <div class="col-25">
                <label for="password">Password</label>
            </div>
            <div class="col-75">
                <input class="login-form" type="password" id="password" name="password" placeholder="Password" required>
            </div>
        </div>
        <div class="row">
            <input type="submit" class="login-btn" value="Log In"> 
        </div>
        <p>Don't have an account? <a href="" class ="signup">Sign up</a></p>
                <p><strong>Demo email:</strong> demo@demo.com</p>
                <p><strong>Demo Password:</strong> demouser</p>
    </form>
</div>
            `;
}
//show login form
function displayLoginPage() {
    const loginPage = renderLoginPage();
    $('.blogPosts').hide();
    $('.new').html(loginPage);
    $('.new').show();
}
//handle login button clicked
function handleLoginButton() {
    $('.login').on('click', function (event) {
        console.log('Login Clicked');
        event.preventDefault();
        displayLoginPage();
    });
}

//authentication
function loginSuccess() {
    $('.area').on('submit', '.login', function (event) {
        console.log('Login Success');
        event.preventDefault();
        //get inputs
        const username = $('#email').val();
        const password = $('#password').val();

        //validate input
        if (username == "") {
            alert('Please input user name');
        } else if (password == "") {
            alert('Please input password');
        }
        //if input valid
        else {
            //data sent to api
            const loginUser = {
                username: username,
                password: password
            };
            console.log(loginUser);
            $.ajax({
                    type: "POST",
                    url: "/auth/login",
                    data: JSON.stringify(loginUser),
                    dataType: "json",
                    contentType: 'application/json'
                })
                //call successful
                .done(function (data) {
                    jwt = data.authToken;
                    sessionStorage.setItem('authToken', jwt);
                    sessionStorage.setItem('username', loginUser.username);
                    console.log('Login success2');
                    console.log(jwt);
                    console.log(data);
                    console.log(loginUser.username );
                    showDashboard(loginUser.username);
                })
                //call failed
                .fail(function (err) {
                    console.err(err);
                    alert('Login Failed. Try again or Sign Up.');
                });
        }
    });
}

//USER HOME PAGE
function renderUserHome(userEntries) {
    var userName = sessionStorage.getItem("username");
    var thisUserEntry = userEntries.filter(function(userEntry) {
        return userEntry.username == userName;
    });
    let html = `
    <div class="navbar" id="myTopnav">
        <div class="user-nav">
            <a href="#" class="dashboard" id="active">Dashboard</a>
            <a href="#" class="newDetail">New Detail</a>
            <a href="#" class="logout-button">Logout</a>
            <a href="javascript:void(0);" class="icon" onclick="myFunction()"><i class="fa fa-bars"></i></a>
        </div>
    </div>

    <main role="main" id="main-page">
        <div class="new">
            <section class="user-page" aria-live="assertive">
            <div class="dashboard-header">
                <legend align="center">My Detail Jobs</legend>
            </div>
            <section class="user-detail-posts">`;
    for (var i = 0; i < thisUserEntry.length; i++) {
        html += `<div class="blogContainer">
                    <div class="content">
                    <img src="${thisUserEntry[i].picture}">
                        <h3>
                            <a href ="#" id="${thisUserEntry[i].id}" class="title">${thisUserEntry[i].title}</a>
                        </h3>
                    </div>
                    <div class="author">
                        <p></p>
                    </div>
                </div>`;
    }
    html += `</div>
        <div class="blogPosts">

        </div>
    </main>
    `;
    return html;
}

function displayDashboard(userEntries) {
    const userHome = renderUserHome(userEntries);
    //$('#main-page').hide();
    $('.navbar').hide();
    $('.area').html(userHome);
    $('.area').show();
}

function showDashboard(user) {
    $.ajax({
            type: 'GET',
            url: '/posts',
            dataType: 'json',
            contentType: 'application/json',
            headers: {
                Authorization: `Bearer ${jwt}`
            }
        })
        .done(function (result) {
            console.log(result);
            displayDashboard(result);
        })
        .fail(function (err) {
            console.err(err);
        });
}
//handle dashboard nav button
function dashboardButton() {
    $('.area').on('click', '.dashboard', function (event) {
        console.log('Dashboard nav button clicked');
        event.preventDefault();
        showDashboard();
    });
}

//NEW POST
function renderNewPost() {
    return `
            <div class="container">
                <form role="form" class="newPost" id="newPost">
                    <div class="post-header">
                        <legend align="center">Add New Detail!!!</legend>
                    </div>
                    <div class="row">
                        <div class="col-25">
                            <label for="title">Title</label>
                        </div>
                        <div class="col-75">
                            <input type="text" id="title" name="title" placeholder="Title" required>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-25">
                            <label for="picture">Image URL</label>
                        </div>
                        <div class="col-75">
                            <input type="text" id="picture" name="picture" placeholder="Image URL" required>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-25">
                            <label for="desc">Content</label>
                        </div>
                        <div class="col-75">
                            <textarea rows="4" cols="40" form="newPost" maxlength="2000" id="desc" name="content" placeholder="Write Something..." required></textarea>
                        </div>
                    </div>
                    <div class="form-group">
                        <input type="submit" class="save-btn">
                    </div>
                </form>
            </div>
    `;
}
//show new post form
function displayNewPostPage() {
    const newPost = renderNewPost();
    $('.blogPosts').hide();
    $('.new').html(newPost);
    $('.new').show();
    //renderNewPost();
}
//handle new detail button clicked
function handleNewPostBtn() {
    $('.area').on('click', '.newDetail', function (event) {
        console.log('New Detail Clicked');
        event.preventDefault();
        displayNewPostPage();
    });
}
//send post request
function postNewDetail() {
    $('.area').on('submit', '.newPost', function (event) {
        console.log('Post new detail');
        event.preventDefault();
        const title = $('#title').val();
        const picture = $('#picture').val();
        const content = $('#desc').val();
        const username = sessionStorage.getItem("username");
        //const author = req.user.id;

        const newPost = {
            title: title,
            picture: picture,
            content: content,
            username: username
        };

        $.ajax({
                type: "POST",
                url: "/posts",
                data: JSON.stringify(newPost),
                dataType: "json",
                contentType: 'application/json',
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            })
            .done(function (result) {
                console.log('made it to getIndividualPost');
                renderIndividualPost(result);
            })
            .fail(function (jqXHR, error, errorThrown) {
                console.error(jqXHR);
                console.error(error);
                console.error(errorThrown);
            });
    });
}

function renderIndividualPost(result) {
    const id = result.id;
    getIndividualPost(id);
}

//EDIT POST
function renderPostToEdit(response) {
    const id = response.id;

    return `
            <div class="container" id="editPost">
                <form role="form" class="editPost" data-entryid="${response.id}" >
                    <div class="post-header">
                        <legend align="center">Edit Your Detail</legend>
                    </div>
                    <div class="row">
                        <div class="col-25">
                            <label for="title">Title</label>
                        </div>
                        <div class="col-75">
                            <input type="text" id="title" name="title" value="${response.title}" >
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-25">
                            <label for="picture">Image URL</label>
                        </div>
                        <div class="col-75">
                            <input type="text" id="picture" name="picture" value="${response.picture}" >
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-25">
                            <label for="desc">Content</label>
                        </div>
                        <div class="col-75">
                            <textarea rows="4" cols="40" form="newPost" maxlength="2000" id="desc" name="content">${response.content}</textarea>
                        </div>
                    </div>
                    <div class="form-group">
                        <input type="submit" class="save-btn" value="Save" entryid="${id}">
                    </div>
                </form>
            </div>
    `;
}

function showEdit(response) {
    const editPost = renderPostToEdit(response);
    $('.new').hide();
    $('.blogPosts').html(editPost);
    $('.blogPosts').show();
}

function retreivePostForEdit(id) {
    $.ajax({
        type: "GET",
        url: `/posts/${id}`,
        dataType: "json",
        contentType: "application/json",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.getItem('authToken'));
        },
        success: function (response) {
            console.log('reachec display for edit');
            console.log(response);
            showEdit(response);
        }
    });
}

function handleEditButton() {
    $('.area').on('click', '.edit-button', function (event) {
        event.preventDefault();
        const id = $(this).data('entryid');
        console.log(this);
        console.log(id);
        retreivePostForEdit(id);
    });
}

function saveEditButton() {
    $('.area').on('submit', '.editPost', function (event) {
        console.log('Submit edit');
        event.preventDefault();
        let title = $('#title').val();
        let picture = $('#picture').val();
        let content = $('#desc').val();
        const id = $(this).data('entryid');
        console.log(id);
        let putObject;

        if (id === undefined) {
            console.log('ID is undefined');
        } else {
            putObject = {
                id,
                title,
                picture,
                content
            };
            
        }
        $.ajax({
                type: 'PUT',
                url: '/posts/' + id,
                dataType: "json",
                contentType: 'application/json',
                data: JSON.stringify(putObject),
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            })
            .done(function () {
                console.log('made it to show');
                showDashboard();
            })
            .fail(function (jqXHR, error, errorThrown) {
                console.error(jqXHR);
                console.error(error);
                console.error(errorThrown);
            });
    });
}

//DELETE FUNCTIONS
function handleDeleteButton() {
    $('.area').on('click', '.delete-button', function (event) {
        console.log('clicked delete button');
        event.preventDefault();
        const id = $(this).data('entryid');
        console.log(id);

        $.ajax({
                type: "DELETE",
                url: '/posts/' + id + '?' + id,
                dataType: "json",
                contentType: 'application/json',
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            })
            .done(function (result) {
                console.log('made it to Delete Post');
                showDashboard(result);
            })
            .fail(function (jqXHR, error, errorThrown) {
                console.error(jqXHR);
                console.error(error);
                console.error(errorThrown);
            });
    });

}

//LOGOUT
function logOutButton() {
    $('.area').on('click', '.logout-button', function (event) {
        event.preventDefault();
        console.log('Logged Out');
        jwt = null;
        sessionStorage.clear();
        location.reload();
    });
}

//EVENT HANDLERS
function eventHandlers() {
    handleNewPostBtn();
    handleTitleClick();
    handleHambugerClick();
    handleLoginButton();
    handleSignUpClick();
    signUpSuccess();
    loginSuccess();
    logOutButton();
    homeButton();
    dashboardButton();
    myFunction();
    rememberUserLog();
    postNewDetail();
    handleEditButton();
    handleDeleteButton();
    saveEditButton();
}

$(eventHandlers);