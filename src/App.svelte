<script lang="ts">
    import {fade} from "svelte/transition";
    import {getContext, onMount} from "svelte";
    import {Box, Expand} from "@dastyinc/kit-panel";
    import {IconButton, Icon, Button} from "nunui";

    const {throttle, ws, wsStore, api} = getContext('utils');
    const channel = getContext('channel');
    const {user_id, user_name} = getContext('account');

    let sendWs = (...props: any[]) => null, curr = -1;

    let posts: any, post_content = "", selected = false;
    let postArr = [];
    let showMore = false;
    export let showAdd = false;
    onMount(() => {
        getPost();
    })

    onMount(() => ws(channel).conn(({message, uid, send}) => {
        sendWs = send;
        wsStore(message, 'POST_UPDATE').subscribe(updatePost);
    }))

    const sendPostUpdate = throttle(() => sendWs('POST_UPDATE'));

    async function getPost() {
        posts = await api(`/post/topic/${channel}`)
        postArr = posts.posts;
    }

    async function alterSelected(post) {
        await api(`/post/topic/delete/${post.post_id}`, {}, 'DELETE')
        post_content = post.post_content;
        api('/post/topic', {user_id, user_name, channel_id: channel, post_content, selected}).then(() => {
            sendPostUpdate()
        }).catch(({error}) => {
        })
        post_content = "";
        showMore = false;
    }

    function deleteSelected(id) {
        return async (e) => {
            e.stopPropagation();
            await api(`/post/topic/delete/${id}`, {}, 'DELETE')
            getPost();
            sendPostUpdate()
            if (postArr.length !== 1) {
                await api(`/post/topic/delete/${postArr[0].post_id}`, {}, 'DELETE')
                post_content = postArr[0].post_content
                await api('/post/topic', {user_id, user_name, channel_id: channel, post_content, selected});
                post_content = "";
                getPost();
                sendPostUpdate()
            }
        }
    }

    async function deleteMore(id) {
        await api(`/post/topic/delete/${id}`, {}, 'DELETE')
        sendPostUpdate();
        await getPost();
    }

    async function updatePost() {
        await getPost();
    }

    function sendPost() {
        api('/post/topic', {user_id, user_name, channel_id: channel, post_content, selected}).then(() => {
            sendPostUpdate()
        });
        post_content = "";
        showAdd = false;
    }

    function showAddFunc() {
        if (showMore) {
            showMore = false;
            showAdd = !showAdd;
        } else showAdd = !showAdd;
    }

    function showMoreFunc() {
        if (showAdd) {
            showAdd = false;
            showMore = !showMore;
        } else showMore = !showMore;
    }

    $: if (postArr.length < 2) showMore = false;

    let input;
    const hide = () => ({duration: 200, css: (t) => `opacity: ${t};height: 0;`});

    $: if (input) {
        void post_content;
        input.style.height = "1px";
        input.style.height = (12 + input.scrollHeight) + "px";
    }
</script>

<div style="display: flex;align-items: baseline">
    <Icon icon="forum" size="36" style="position: relative;top:6px;"/>
    <div class="title">여기우리 대화방</div>
    <span style="margin-left: auto;"></span>
    <IconButton icon={showAdd ? "close" : "add"} on:click={showAddFunc} style="float: right;"/>
</div>


{#await getPost()}
    <Box style="padding: 0.938rem 1.25rem 1.25rem 1.25rem">Loading...</Box>
{:then _}
    {#if postArr.length === 0}
        <Box style="background-color: #6917f3; margin-top: 0.938rem; box-shadow: 0 10px 10px 0 rgba(0, 0, 0, 0.3); padding: 0.938rem 1.25rem 1.25rem 1.25rem">
            <div style="text-align: center;">포스트가 없습니다.</div>
        </Box>
    {:else}
        <Box hoverCursor onClick={showMoreFunc} hoverScale
             style="background-color: #6917f3; margin-top: 0.938rem; position:relative; z-index: 2; box-shadow: 0 10px 10px 0 rgba(0, 0, 0, 0.3); padding: 0.938rem 1.25rem 1.25rem 1.25rem;cursor: pointer;">
            <div style="display: flex; justify-content: space-between;">
                <div>
                    <div class="name" style="color: #6917f3;">Topic | {postArr[postArr.length - 1].user_name}</div>
                </div>
                <IconButton icon="done" on:click={deleteSelected(postArr[postArr.length - 1].post_id)}/>
            </div>
            <div class="content">{postArr[postArr.length - 1].post_content}</div>
        </Box>
    {/if}

    {#if showMore}
        <div style="height: fit-content;" out:hide>
            <div class="post-container" transition:fade>
                {#each postArr as post, i}
                    {#if i !== postArr.length - 1}
                        <Box hoverCursor onClick={() => alterSelected(post)}
                             style="background-color: #9e17f3; margin-bottom: 0.6rem; box-shadow: 0 10px 10px 0 rgba(0, 0, 0, 0.3); padding: 0.938rem 1.25rem 1.25rem 1.25rem">
                            <div style="display: flex; justify-content: space-between;">
                                <div>
                                    <div class="name" style="color: #9e17f3;">Topic | {post.user_name}</div>
                                </div>
                                <IconButton icon="done" on:click={deleteSelected(postArr[postArr.length - 1].post_id)}/>
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
    <Expand>
        <div in:fade={{duration: 200}} out:hide>
            <Box style="background-color: #18137f; margin-top: 0.6rem; position:relative; top: -1.5rem; z-index:3; scale:105%; margin-bottom: -1.5rem; box-shadow: 0 10px 10px 0 rgba(0, 0, 0, 0.3); padding: 0.938rem 1.25rem 1.25rem 1.25rem">
                <div class="name" style="color: #18137f;">Topic | 나</div>
                <textarea placeholder="추가할 주제를 입력해주세요" spellcheck="false" bind:value={post_content} bind:this={input}
                          autofocus rows="1"></textarea>
                <Button small transparent style="float: right" on:click={sendPost}>완료</Button>
                <br> <br>
            </Box>
        </div>
    </Expand>
{/if}

<style lang="scss">
  .title {
    margin-left: 6px;
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
    white-space: pre;
  }

  .post-container {
    position: relative;
    top: -4rem;
    z-index: 1;
    margin-top: 0.6rem;
    margin-bottom: -4rem;
    padding-top: 4rem;
    overflow-y: scroll;
    max-height: 17rem;
    -ms-overflow-style: none;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
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
    outline: none;

    &::placeholder {
      color: white;
      font-weight: 100;
    }
  }

  span {
    -webkit-user-select: none;
    margin-left: auto;
    cursor: pointer;
  }
</style>
