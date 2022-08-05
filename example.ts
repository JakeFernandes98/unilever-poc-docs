const callUrl = 'https://dclapi.azurewebsites.net/api/' //API URL
let playerInfo;
let parcelId = 1 //Hardcoded parcel Id
const apiEventManager = new EventManager() //Initialising the Event Manager


//Fetching user data may time some time, so it is better to fetch it as soon 
//as the player enters the scene and then reuse the information while they remain on the scene
function initAPI(){
    executeTask(async () => {
        playerInfo = await getUserData()
    })
}

// Defining an Event, where the experienceId is being passed as an argument
@EventConstructor()
export class EnterExperience {
  experienceId: number;
  constructor(experienceId: number){
    this.experienceId = experienceId
  }
}

// Defining the listener for the event, here we will make the API request
apiEventManager.addListener(EnterExperience, null, ({experienceId}) => {
  if(!freeze){
    let json: JSON
    
    // generate a timestamp
    let timestamp = new Date()
    
    // pull specific user data
    let isUserGuest = !(playerInfo.hasConnectedWeb3)
    let userId = isUserGuest ? playerInfo.userId : playerInfo.publicKey
    let userName = playerInfo.displayName

    // make API call
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

// Define an entity for the trigger
const floor = new Entity()
// Position it in the middle of the experience
floor.addComponent(new Transform({
  position: new Vector3(8,4,8)
}))
floor.addComponent(
    // Add the trigger component
    new utils.TriggerComponent(
        // Add the appropriate trigger shape with the appropriate sizing
      new utils.TriggerBoxShape(new Vector3(16, 4, 16), Vector3.Zero()),
          {
          // When the user enters this trigger box, the event will fire
          onCameraEnter: () => {
            apiEventManager.fireEvent(new EnterExperience(1))        
          },
          // Can also make another call when the user exits
          onCameraExit: () => {
          })
)
