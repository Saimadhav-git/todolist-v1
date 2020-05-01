const express=require("express");
const bodyParser=require("body-parser");
const _=require("lodash");
const https=require("https");
const app=express();
const mongoose=require('mongoose');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");

var day="";
/*
var items=["Buy Food","Cook Food","Eat Food"];
var lists=[];
*/
mongoose.connect("mongodb+srv://admin-luffy:luffy@cluster0-5zo2w.mongodb.net/todolistDB",{ useUnifiedTopology: true });
const itemsSchema={
  name:String
};
const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
  name:"Buy Food"
});
const item2=new Item({
  name:"Cook food"
});
const item3=new Item({
  name:"Eat food"
});
const defaultItems=[item1,item2,item3];
const listSchema={
  name:String,
  items1:[itemsSchema]
};
const List=mongoose.model("List",listSchema);

app.get("/",function(req,res){
  var today=new Date();
  var x=today.getDay();
  var options={
    weekday:"long",
    day:"numeric",
    month:"long"
  };
  var day=today.toLocaleDateString("en-US",options);
  /*
  switch (x) {
  case 0:day="sunday";break;
  case 1:day="monday";break;
 case 2:day="tuesday";break;
 case 3:day="wednesday";break;
case 4:day="thursday";break;
  case 5:day="friday";break;
  case 6:day="saturday";break;
    default:day="luffyday";break

  }*/
  Item.find({},function(err,foundItems){
    if(foundItems.length==0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log("something wrong in inserting elements");
        }
        else{
          console.log("success");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list",{listTitle:"Today",items:foundItems});
    }
  });


});

app.post("/",function(req,res){
  const listName=req.body.list;
  console.log("in post "+listName);
  const itemname=req.body.newItem;
  const item=new Item({
    name:itemname
  });

if(listName=="Today"){
  item.save();
  res.redirect("/");
}
else{
  List.findOne({name:listName},function(err,foundList){

      foundList.items1.push(item);
      foundList.save();
      res.redirect("/"+listName);

  });
}


});
app.post("/delete",function(req,res){
const checkedId=req.body.checkbox;
const listName=req.body.listName;
console.log(listName);
if(listName=="Today"){
  Item.findByIdAndRemove(checkedId,function(err){
   if(!err){
     console.log("successfully deleted");
 res.redirect("/");
   }

 });

}
else{
List.findOneAndUpdate({name:listName},{$pull:{items1:{_id:checkedId}}},function(err){
  if(!err){
    res.redirect("/"+listName);
  }


});
}
});
app.get("/:customListName",function(req,res){
const customListName=_.capitalize(req.params.customListName);

const defaultItems1=req.body.newItem;
List.findOne({name:customListName},function(err,foundList){
if(!err){
  if(!foundList){
    const list=new List({
      name:customListName,
      items1:defaultItems
    });
    list.save();
    res.redirect("/"+customListName);
  }
  else{
    res.render("list",{listTitle:foundList.name,items:foundList.items1});
  }
}
});

});
/*
app.get("/work",function(req,res){

  res.render("list",{todaysday:"work",items:lists})
});
*/
app.listen(process.env.PORT ||3000,function(){
  console.log("Server is running in port 3000");

});
