const callUrl = 'https://dclapi.azurewebsites.net/api/'
let playerInfo;
let parcelId = 1
const apiEventManager = new EventManager()

function initAPI(){
    executeTask(async () => {
        playerInfo = await getUserData()
    })
}

@EventConstructor()
export class EnterExperience {
  experienceId: number;
  constructor(experienceId: number){
    this.experienceId = experienceId
  }
}

apiEventManager.addListener(EnterExperience, null, ({experienceId}) => {
  if(!freeze){
    let json: JSON
    let timestamp = new Date()
    
    let isUserGuest = !(playerInfo.hasConnectedWeb3)
    let userId = isUserGuest ? playerInfo.userId : playerInfo.publicKey
    let userName = playerInfo.displayName

  
    executeTask(async () => {
        try {
            let response = await fetch(callUrl+"experience", {
              headers: { "Content-Type": "application/json" },
              method: "POST",
              body: JSON.stringify({
                "timestamp" : timestamp,
                "parcel_id" : parcelId,
                "experience_id" : experienceId,
                "action" : "ENTER",
                "user_guest" : isUserGuest,
                "user_id" : userId,
                "user_name" : userName,
              }),
            })
            json = await response.json()
          } catch {
          }
    })

    return JSON.stringify(json)
  }
})

const floor = new Entity()
floor.addComponent(new Transform({
  position: new Vector3(8,4,8)
}))
floor.addComponent(
    new utils.TriggerComponent(
      new utils.TriggerBoxShape(new Vector3(16, 4, 16), Vector3.Zero()),
          {
          onCameraEnter: () => {
            apiEventManager.fireEvent(new EnterExperience(1))        
          })
)