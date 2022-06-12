async function test(){
  const user = await require('node-fetch')('https://users.roblox.com/v1/users/authenticated')
  return console.log(user)
}
test()