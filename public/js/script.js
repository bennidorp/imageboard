new Vue({
    el: "#main",
    data: {
        title: "",
        username: "",
        file: "",
        images: [],
        selectedImageID: false,
    },
    mounted() {
        axios.get("/api/images").then((response) => {
            this.images = response.data;
        });
    },
    methods: {
        uploadImage: function () {
            console.log("UPLOAD.");

            const formData = new FormData();
            formData.append("title", this.title);
            formData.append("username", this.username);
            formData.append("file", this.file);

            axios.post("/api/upload", formData).then((response) => {
                this.title = this.fileSelected = this.username = this.description =
                    "";
                this.images.unshift(response.data);
            });
        },
        fileselected: function (event) {
            console.log("event.target.files", event.target.files);
            this.file = event.target.files[0];
            console.log("this.file", this.file);
        },
    },
});

Vue.component("image-overlay", {
    template: "#template-image-overlay",
    props: ["id"],
    data: function () {
        return {
            url: "",
            title: "",
            username: "",
            createdAt: "",
        };
    },
    methods: {
        closeMe: function () {
            this.$emit("close");
        },
    },
    mounted: function () {
        axios.get("/api/image/" + this.id).then((response) => {
            const { url, username, title, created_at } = response.data;
            this.url = url;
            this.username = username;
            this.title = title;
            this.createdAt = new Date(created_at).toLocaleDateString();
        });
    },
});
