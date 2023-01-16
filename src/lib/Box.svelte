<script lang="ts">
    import Expand from "$lib/Expand.svelte";
    export let style = "", hoverScale = false, hoverCursor = false, _fade = false;
    export let onClick = () => null;
</script>

<div class={ hoverScale ? "_box" : "box"} id={hoverCursor ? "_cursor" : "cursor"} style={style} on:click={onClick}>
    <Expand>
        <slot/>
    </Expand>
</div>

<style>
    .box {
        height: fit-content;
        border-radius: 20px;
        transition: 0.2s;
    }

    ._box {
        height: fit-content;
        border-radius: 20px;
        transition: 0.2s;
    }

    ._box:hover {
        scale: 1.04;
    }

    #_cursor:hover {
        cursor: pointer;
    }
</style>
