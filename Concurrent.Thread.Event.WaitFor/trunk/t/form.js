//@esmodpp

//@require Concurrent.Thread.Event.WaitFor
//@require Concurrent.Thread.Compiler
//@require WebBrowser.Cookie


Concurrent.Thread.create(function(){

    var cookie = new WebBrowser.Cookie("username", {duration:"1m"});

    document.body.innerHTML += "�悤���� " + getUserName() + " ����";

    function getUserName ( ) {
        var name = cookie.load();
        if ( name ) {
            return name;
        } else {
            name = promptUserName();
            cookie.store(name);
            return name;
        }
    }

    function promptUserName ( ) {
        var form = document.createElement("FORM");
        form.innerHTML += '���O����͂��Ă�������'
                       +  '<input type="text" name="name">'
                       +  '<input type="button" name="OK" value="OK">';
        document.body.appendChild(form);
        Concurrent.Thread.Event.waitFor(form.OK, "click");
        return form.name.value;
    }
    
});
