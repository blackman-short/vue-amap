import Vue from 'vue'
import {
  Input,
  Button,
  Select,
  OptionGroup,
  Option,
  Dialog,
  Upload,
  Pagination,
  Form,
  FormItem,
  Tooltip,
  Avatar,
  Message,
  MessageBox,
  Notification
} from 'element-ui'

Vue.prototype.$ELEMENT = { size: 'small', zIndex: 3000 }

Vue.use(Input).use(Button).use(Select).use(OptionGroup)
  .use(Option).use(Dialog).use(Upload).use(Pagination)
  .use(Form).use(FormItem).use(Tooltip).use(Avatar)

Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$notify = Notification
Vue.prototype.$message = Message
