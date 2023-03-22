<script lang="ts">
  import type { ConversationEntry } from './conversation';

  export let history: ConversationEntry[] = [];
</script>

<div class="bg-gray-100 p-4 rounded mt-4">
  {#each history as item}
    <div
      class="py-2 text-sm font-semibold {item.role === 'user' ? 'text-blue-600' : 'text-pink-600'}"
    >
      <strong>{item.role}:</strong>
      {item.content}
    </div>
  {/each}
</div>
