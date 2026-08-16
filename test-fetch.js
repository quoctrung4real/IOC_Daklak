async function run() {
  const res = new Response('{"a": 1}');
  const cloned = res.clone();
  
  const d1 = await cloned.json();
  console.log("Cloned json:", d1);
  
  const d2 = await res.json();
  console.log("Original json:", d2);
}
run();
