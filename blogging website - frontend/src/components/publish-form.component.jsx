import { useContext } from "react";
import AnimationWrapper from "../common/page-animation";
import {Toaster, toast} from "react-hot-toast";
import Editor, { EditorContext } from "../pages/editor.pages";
import Tag from "./tags.component";
import { UserContext } from "../App";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import axios from "axios";


const PublishForm = () => {

    let characterLimit = 200;
    let tagLimit = 5;

    let { blog_id } = useParams();

    let { blog, blog: {banner, title, tags, des, content}, setEditorState, setBlog} = useContext(EditorContext);

    let { userAuth : {access_token} } = useContext(UserContext)

    let navigate = useNavigate()

    const handleCloseEvent = () => {
        setEditorState("editor")
    }

    const handleTitleChange = (e) => {

        let input = e.target;

        setBlog({...blog, title:input.value})

    }

    const handleDescChange = (e) => {
        
        let input = e.target;

        setBlog({...blog, des:input.value})
    }

    const handleTitleDown = (e) => {
        if (e.keyCode == 13) { //enter key
            e.preventDefault();
        }
    }

    const handleKeyDown = (e) => {
        if (e.keyCode == 13 || e.keyCode==188) { //enter key
            e.preventDefault();
            let tag = e.target.value.toLowerCase();

            if (tags.length < tagLimit){
                if(!tags.includes(tag) && tag.length){
                    setBlog({...blog, tags : [...tags, tag]})
                }
            }else{
                toast.error(`You can only add ${tagLimit} tags`)
            }
            e.target.value = "";
        }
    }


    const publishBlog = (e) =>{

        let allowedTags = ["tech", "gaming", "pop culture", "social media", "finance", "sports", "music", "nature", "travel"]

        let hasCommonItem = tags.some(tag => allowedTags.includes(tag));

        if (e.target.className.includes("disable")){
            return;
        }

        if(!title.length){
            return toast.error("You must provide a title to publish the blog")
        }
        if(!des.length || des.length>200){
            return toast.error("You must provide a blog description under 200 characters to publish")
        }
        if(!tags.length){
            return toast.error("You need at least 1 tag to publish your blog")
        }
        if(tags.length>5){
            return toast.error("You cannot add more than 5 tags to your blog")
        }
        if(!hasCommonItem){
            return toast.error("Your tags need to include at least one of the main tags")
        }


        let loadingToast = toast.loading("Publishing...")

        e.target.classList.add("disable")

        let blogObj = {
            title, banner, des, content, tags, draft:false
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", {...blogObj, id: blog_id}, {
            headers : {
                'Authorization' : `Bearer ${access_token}`
            }
        })
        .then(()=> {
            e.target.classList.remove("disable")

            toast.dismiss(loadingToast)
            toast.success("Published!")

            setTimeout(() => {
                navigate("/dashboard/blogs")
            }, 500)

        })
        .catch(({ response } ) =>{
            e.target.classList.remove("disable")
            toast.dismiss(loadingToast)

            return toast.error(response.data.error)
        })


    }

    return (
        <AnimationWrapper>
            <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-32 lg:gap-4">

            
                <Toaster/>

                <button className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]" onClick={handleCloseEvent}>
                    <i className="fi fi-br-cross"></i>
                </button>

                <div className="max-w-[550px] center">

                    <p className="text-dark-grey mb-1">Preview your blog</p>

                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
                        <img src={banner}/>
                    </div>

                    <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">{title}</h1>

                    <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">{des}</p>

                </div>

                <div className="border-grey lg:border-1 lg:pl-8">

                    <p className="text-dark-grey mb-2 mt-9">Blog Title</p>

                    <input 
                        onChange={handleTitleChange} 
                        type="text" 
                        placeholder="Blog Title" 
                        defaultValue={title} 
                        className="input-box pl-4"></input>
                
                    <p className="text-dark-grey mb-2 mt-9">Short description of your blog (Maximum 200 characters)</p>
                    <textarea 
                        placeholder=""
                        maxLength={characterLimit} 
                        defaultValue={des}
                        
                        className="h-40 resize-none leading-7 input-box"
                        onChange={handleDescChange}
                        onKeyDown={handleTitleDown}></textarea>

                    <p className="mt-1 text-dark-grey text-sm text-right">{des?characterLimit-des.length:characterLimit} characters left</p>
                    
                    
                    <p className="text-dark-grey mb-2 mt-9">Add some tags to describe what your blog is about</p>
                    <p className="text-sm mb-2 mt-9">Your tags need to include at least one of the main tags:</p>
                    <p className="text-sm mb-2">(Tech, Gaming, Pop Culture, Social Media, Finance, Sports, Music, Nature, Travel)</p>

                    <div className="relative input-box pl-2 py-2 pb-4">
                        <input 
                        type="text" 
                        placeholder="Tag" 
                        className="sticky input-box bg-white top-0 left-0 pl-4 mb-10 focus:bg-white"
                        onKeyDown={handleKeyDown}
                        ></input>
                    </div>
                    {tags.map((tag, i)=>{
                        return <Tag tag={tag} tagIndex={i} key={i} />
                    })}
                    

                    <p className="mt-1 mb-2 text-dark-grey text-right">{tagLimit-tags.length} Tags left</p>
                    
                    <button className="btn-dark px-8 " onClick={publishBlog}>Publish</button>
                </div>



            </section>
        </AnimationWrapper>
    )
}

export default PublishForm;