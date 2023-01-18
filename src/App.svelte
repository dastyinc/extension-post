<script lang="ts">
    import {fade} from "svelte/transition";
    import {getContext, onMount} from "svelte";
    import {Box} from "@dastyinc/kit-panel";

    const {throttle, ws, wsStore, api} = getContext('utils');
    const channel = getContext('channel');
    let {user_id, user_name} = getContext('account');

    let sendWs, curr = -1;

    let posts: any, post_content = "", selected = false;
    let postArr = [];
    let showMore = false;
    export let showAdd = false;
    onMount(() => {
        getPost();
    })

    onMount(() => ws(channel).conn(({message, uid, send}) => {
        sendWs = send;
        wsStore(message, 'POST_UPDATE').subscribe((msg) => updatePost(msg.id));
    }))
    $: sendPostUpdate = throttle(() => {
        sendWs?.({type: 'POST_UPDATE'});
    });

    async function getPost() {
        posts = await api(`/post/topic/${channel}`)
        postArr = posts.posts;
    }

    async function alterSelected(post) {
        await api(`/post/topic/delete/${post.post_id}`, {}, 'DELETE')
        _user_name = post.user_name;
        post_content = post.post_content;
        api('/post/topic', {user_id, user_name, channel_id: channel, post_content, selected}).then(() => {
            sendPostUpdate()
        }).catch(({error}) => {
        })
        _user_name = "";
        post_content = "";
        showMore = false;
    }

    async function deleteSelected(id) {
        await api(`/post/topic/delete/${id}`, {}, 'DELETE')
        getPost();
        sendPostUpdate()
        if (postArr.length !== 1) {
            await api(`/post/topic/delete/${postArr[0].post_id}`, {}, 'DELETE')
            post_content = postArr[0].post_content
            api('/post/topic', {user_id, user_name, channel_id: channel, post_content, selected}).then(() => {
            }).catch(({error}) => {
            })
            post_content = "";
            getPost();
            sendPostUpdate()
        }
    }

    async function deleteMore(id) {
        await api(`/post/topic/delete/${id}`, {}, 'DELETE')
        getPost();
        sendPostUpdate();
    }

    async function updatePost() {
        getPost()
    }

    function sendPost() {
        api('/post/topic', {user_id, user_name, channel_id: channel, post_content, selected}).then(() => {
            sendPostUpdate()
        }).catch(({error}) => {
        })
        post_content = "";
        showAdd = false;
    }

    function showAddFunc() {
        if (showMore) {
            showMore = false;
            showAdd = !showAdd;
        } else {
            showAdd = !showAdd;
        }
    }

    function showMoreFunc() {
        if (showAdd) {
            showAdd = false;
            showMore = !showMore;
        } else {
            showMore = !showMore;
        }
    }

    $: if (postArr.length < 2) showMore = false;

</script>

<div style="display: flex;">
    <div class="icon">
        <div style="margin: auto;">💬</div>
    </div>
    <div class="title">여기우리 대화방</div>
</div>

<div style="float: right; margin-top: -1.4rem"><span class="material-symbols-outlined" on:click={showAddFunc}>{showAdd ? "close" : "add"}</span></div>

{#await getPost()}
    <Box style="padding: 0.938rem 1.25rem 1.25rem 1.25rem">Loading...</Box>
{:then _}
    {#if postArr.length === 0}
        <Box style="background-color: #6917f3; margin-top: 0.938rem; box-shadow: 0 10px 10px 0 rgba(0, 0, 0, 0.3); padding: 0.938rem 1.25rem 1.25rem 1.25rem">
            <div style="text-align: center;">포스트가 없습니다.</div>
        </Box>
    {:else}
        <Box hoverCursor onClick={showMoreFunc} hoverScale
             style="background-color: #6917f3; margin-top: 0.938rem; position:relative; z-index: 2; box-shadow: 0 10px 10px 0 rgba(0, 0, 0, 0.3); padding: 0.938rem 1.25rem 1.25rem 1.25rem">
            <div style="display: flex; justify-content: space-between;">
                <div>
                    <div class="name" style="color: #6917f3;">Topic | {postArr[postArr.length - 1].user_name}</div>
                </div>
                <span class="material-symbols-outlined"
                      on:click|stopPropagation={deleteSelected(postArr[postArr.length - 1].post_id)}>done</span>
            </div>
            <div class="content">{postArr[postArr.length - 1].post_content}</div>
        </Box>
    {/if}

    {#if showMore}
        <div style="height: fit-content;">
            <div class="post-container" transition:fade>
                {#each postArr as post, i}
                    {#if i !== postArr.length - 1}
                        <Box hoverCursor onClick={() => alterSelected(post)}
                             style="background-color: #9e17f3; margin-bottom: 0.6rem; box-shadow: 0 10px 10px 0 rgba(0, 0, 0, 0.3); padding: 0.938rem 1.25rem 1.25rem 1.25rem">
                            <div style="display: flex;">
                                <div>
                                    <div class="name" style="color: #9e17f3;">Topic | {post.user_name}</div>
                                </div>
                                <span class="material-symbols-outlined"
                                      on:click|stopPropagation={deleteMore(post.post_id)}>done</span>
                            </div>
                            <div class="content">{post.post_content}</div>
                        </Box>
                    {/if}
                {/each}
            </div>
        </div>
    {/if}
{/await}

{#if showAdd}
    <div transition:fade>
        <Box style="background-color: #18137f; margin-top: 0.6rem; position:relative; top: -1.5rem; z-index:3; scale:105%; margin-bottom: -1.5rem; box-shadow: 0 10px 10px 0 rgba(0, 0, 0, 0.3); padding: 0.938rem 1.25rem 1.25rem 1.25rem">
            <div class="name" style="color: #18137f;">Topic | 나</div>
            <textarea placeholder="추가할 주제를 입력해주세요" spellcheck="false" bind:value={post_content} autofocus rows="1"/>
            <div class="submit" on:click={sendPost}>완료</div>
        </Box>
    </div>
{/if}

<style lang="scss">
  .icon {
    font-size: 2.25rem;
    margin-right: 0.625rem;
    width: 10.8%;
    height: 10.8%;
  }

  .title {
    font-size: 1.75rem;
    font-weight: 900;
    line-height: 3rem;
  }

  .name {
    display: inline-block;
    border-radius: 10px;
    box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
    background-color: #dce6f2;
    font-size: 0.875rem;
    width: fit-content;
    padding: 0.1875rem 0.625rem 0.1875rem 0.625rem;
    line-height: 1.4rem;
    margin: 0.138rem 0 0 0.05rem;
  }

  .content {
    margin: 0.625rem 0 0.138rem 0.45rem;
    font-size: 1.25rem;
    height: fit-content;
  }

  span {
    -webkit-user-select: none;
  }

  .post-container {
    position: relative;
    top: -4rem;
    z-index: 1;
    margin-top: 0.6rem;
    margin-bottom: -4rem;
    padding-top: 4rem;
    overflow-y: scroll;
    height: 17rem;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .post-container::-webkit-scrollbar {
    display: none;
  }

  textarea {
    width: 98%;
    resize: none;
    background-color: transparent;
    border: none;
    font-size: 1.25rem;
    font-weight: bold;
    color: #bcc3cb;
    margin-top: 0.625rem;
  }

  textarea::placeholder {
    color: white;
    font-weight: 100;
  }

  textarea:focus {
    outline: none;
  }

  .submit {
    margin-top: 0.625rem;
    margin-left: auto;
    color: white;
    font-size: 1rem;
    font-weight: normal;
    width: fit-content;
    padding: 0 0.4rem 0 0.4rem;
    line-height: 1.4rem;
  }

  .submit:hover {
    cursor: pointer;
  }

  span {
    margin-left: auto;
  }

  span:hover {
    cursor: pointer;
  }
</style>
