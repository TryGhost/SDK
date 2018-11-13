const Members = require('@tryghost/members-layer1');

const members = Members.create();

const show = el => el.style.display = 'block';
const hide = el => el.style.display = 'none';
const reload = () => location.reload();

const setCookie = (token) => {
    if (!token) {
        document.cookie = 'member=null;path=/;samesite;max-age=0';
    } else {
        document.cookie = `member=${token};path=/;samesite;`;
    }
    return token;
};

module.exports = {
    init() {
        const signin = document.querySelector('[data-members-signin]');
        const signout = document.querySelector('[data-members-signout]');

        const render = (token) => {
            if (token) {
                show(signout);
                hide(signin);
            } else {
                show(signin);
                hide(signout);
            }
            return token;
        };

        signin.addEventListener('click', (event) => {
            event.preventDefault();
            members.login()
                .then(members.getToken)
                .then(setCookie)
                .then(reload);
        });

        signout.addEventListener('click', (event) => {
            event.preventDefault();
            members.logout()
                .then(members.getToken)
                .then(setCookie)
                .then(reload);
        });

        return members.getToken()
            .then(setCookie)
            .then(render);
    }
};
