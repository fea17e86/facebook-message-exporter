# facebook-message-exporter

node convert-facebook-messages -i resources/fb-messages.htm -o resources/threads.json
node filter-messages -i resources/threads.json -n "Tobbis Bälch, Cynthia García Belch" -f "2014-06-01" -t "2014-11-01"
node display-thread -i "resources/Tobbis Bälch, Cynthia García Belch.json" -t "book" -c 100
lessc css/book.less css/book.css
