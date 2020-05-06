module.exports = {
    html: {
        src: './dj_src/html',
        dest: './blog/shamsla/templates/shamsla'
    },
    css: {
        src: './dj_src/css',
        dest: './blog/shamsla/static/shamsla/css',
        cssRegs: [{
                before: unhashed_name => new RegExp(`<link rel="stylesheet" href="{% static 'shamsla\\/css\\/${unhashed_name}\\.*\\w*\\.css' %}">`),

                after: hashed_name => `<link rel="stylesheet" href="{% static 'shamsla/css/${hashed_name}' %}">`

            },
            {
                before: unhashed_name => new RegExp(`<link rel="stylesheet" href="{% static 'users\\/css\\/${unhashed_name}\\.*\\w*\\.css' %}">`),

                after: hashed_name => `<link rel="stylesheet" href="{% static 'users/css/${hashed_name}' %}">`

            }
        ]
    },
    js: {
        src: './dj_src/js',
        dest: './blog/shamsla/static/shamsla/js',
        jsReg: {
            before: unhashed_name => new RegExp(`<script src="{% static 'shamsla\\/js\\/${unhashed_name}\\.*\\w*\\.js' %}"></script>`),

            after: hashed_name => `<script src="{% static 'shamsla/js/${hashed_name}' %}"></script>`

        }
    },

    mappings: {
        run: true,
        html: {
            run: true,
            filemaps: [{
                names: ['register', 'login', 'logout', 'profile', 'profile_change', 'u_posts', 'stats', 'small_following'],
                path: './blog/users/templates/users'
            }]
        },

        css: {
            run: true,
            filemaps: [{
                names: ['change_pro', 'profile'],
                path: './blog/users/static/users/css'
            }]
        },

        js: {
            run: false,
            filemaps: [{
                names: [],
                path: './blog/users/static/shamsla/js'
            }]
        }
    },


    proxy: 'http://127.0.0.1:8000/',

    watch: [{
        watch: (gulp, reload) => gulp.watch('./blog/**/*.py', gulp.series(cb => {
            setTimeout(() => reload(cb), 4000);
        }))
    }]

}