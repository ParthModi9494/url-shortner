const app = new Vue({
    el: "#app",
    data: {
        showForm: true,
        url: "",
        slug: "",
        message: "",
        shortenedUrl: "",
        success: false,
        urlCopied: false,
        validationErrors: {}
    },
    methods: {
        createURL() {
            this.resetData();
            if (!this.validateInputs().valid) {
                return;
            }
            axios.post("/url", { url: this.url.trim(), slug: this.slug.trim() }).then((res) => {
                if (res.status === 200) {
                    this.message = res.data.message;
                    this.success = res.data.success;
                    this.shortenedUrl = res.data.result.shortenedUrl;
                }
            })
        },
        copyURL() {
            const textToCopy = document.getElementById("shortenedUrl");
            textToCopy.select();
            document.execCommand("copy");
            textToCopy.blur();
            this.urlCopied = true;
        },
        validateInputs() {
            var expression = /(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w-]*)*\/?\??([^#\n\r]*)?#?([^\n\r]*)/g
            var regex = new RegExp(expression);
            const url = this.url.trim();
            if (!url.match(regex)) {
                this.validationErrors.valid = false;
                this.validationErrors.url = "Please provide valid URL!"
            } else {
                this.validationErrors.valid = true;
            }
            return this.validationErrors;
        },
        resetData() {
            this.message = "";
            this.success = false;
            this.shortenedUrl = "";
            this.validationErrors = {};
            this.urlCopied = false;
        }
    }

});
